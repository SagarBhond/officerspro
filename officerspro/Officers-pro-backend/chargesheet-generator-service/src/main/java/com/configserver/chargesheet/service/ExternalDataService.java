package com.configserver.chargesheet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class ExternalDataService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${external.fir-service:http://localhost:8087/api/victim/fir}")
    private String firServiceBase;

    @Value("${external.investigation-service:http://localhost:3000/investigation}")
    private String investigationServiceBase;

    // MUST point to your Document service base (gateway or direct)
    // Example: http://localhost:8085/api/documents
    @Value("${external.document-service:http://localhost:8085/api/documents}")
    private String documentServiceBase;

    public Map<String, Object> getFir(String firId){
        // Calls: GET http://localhost:8087/api/victim/fir/{firId}
        String url = String.format("%s/%s", firServiceBase, firId);
        Map<String, Object> raw = restTemplate.getForObject(url, Map.class);
        if (raw == null) return Map.of();

        // raw structure = {
        //   crimeDateTime, firId, complaint{...}, accused[], description,
        //   firDocumentPath, registeredOn, sections, victims[], status, witnesses[]
        // }

        Map<String, Object> fir = new HashMap<>(raw);

        // 1) Normalize policeStation + officerInCharge from complaint or static mapping if needed
        // New API doesn’t expose policeStation/officerInCharge explicitly; you can:
        // - add them server-side in FIR service, OR
        // - derive them here if you have mapping or leave "N/A".
        fir.putIfAbsent("policeStation", "N/A");
        fir.putIfAbsent("officerInCharge", "N/A");

        // 2) Build participants structure expected by PDF generator
        Map<String, Object> participants = new HashMap<>();

        // Complainants: from complaint node (adapt as per your domain)
        Map<String, Object> complaint = (Map<String, Object>) raw.get("complaint");
        if (complaint != null) {
            Map<String, Object> comp = new HashMap<>();
            comp.put("name", complaint.get("subject"));          // or actual complainant name when you have it
            comp.put("description", complaint.get("description"));
            participants.put("complainants", List.of(comp));
        }

        // Victims
        List<Map<String, Object>> victims = (List<Map<String, Object>>) raw.get("victims");
        if (victims != null) {
            List<Map<String, Object>> victimList = new ArrayList<>();
            for (Map<String, Object> v : victims) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", v.get("victimName"));
                m.put("address", v.get("victimAddress"));
                m.put("age", v.get("victimAge"));
                m.put("mobile", v.get("victimMobileNo"));
                victimList.add(m);
            }
            participants.put("victims", victimList);
        }

        // Accused
        List<Map<String, Object>> accused = (List<Map<String, Object>>) raw.get("accused");
        if (accused != null) {
            List<Map<String, Object>> accList = new ArrayList<>();
            for (Map<String, Object> a : accused) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", a.get("accusedName"));
                m.put("address", a.get("accusedAddress"));
                m.put("age", a.get("accusedAge"));
                m.put("status", a.get("arrestStatus"));
                accList.add(m);
            }
            participants.put("accused", accList);
        }

        // Witnesses
        List<Map<String, Object>> witnesses = (List<Map<String, Object>>) raw.get("witnesses");
        if (witnesses != null) {
            List<Map<String, Object>> witList = new ArrayList<>();
            for (Map<String, Object> w : witnesses) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", w.get("witnessName"));
                m.put("address", w.get("witnessAddress"));
                m.put("mobile", w.get("witnessContactNumber"));
                m.put("age", w.get("witnessAge"));
                witList.add(m);
            }
            participants.put("witnesses", witList);
        }

        fir.put("participants", participants);

        return fir;
    }


    public Map<String, Object> getInvestigationSummary(String investigationId){
        String url = String.format("%s/summary/%s", investigationServiceBase, investigationId);
        return restTemplate.getForObject(url, Map.class);
    }

    public Map<String, Object> getInvestigationFerristReady(String investigationId){
        String url = String.format("%s/ferrist-ready/%s", investigationServiceBase, investigationId);
        return restTemplate.getForObject(url, Map.class);
    }

    /**
     * Get document metadata and inject a signed URL on the fly.
     * Returns: fileName, mimeType (best-effort), s3Link (signed URL), filePath (signed URL).
     */
    public Map<String,Object> getDocumentMetadata(Long documentId){
        // 1) Base metadata: GET /api/documents/{id}
        String metaUrl = String.format("%s/%d", documentServiceBase, documentId);
        Map<String, Object> dto = restTemplate.getForObject(metaUrl, Map.class);
        if (dto == null) return Map.of();

        // 2) Signed URL: GET /api/documents/{id}/signed-url
        String signedUrlEndpoint = String.format("%s/%d/signed-url", documentServiceBase, documentId);
        Map<String, Object> signedResp = restTemplate.getForObject(signedUrlEndpoint, Map.class);
        String signedUrl = signedResp != null ? (String) signedResp.get("signedUrl") : null;

        Map<String, Object> result = new HashMap<>();

        // fileName
        String fileName = dto.get("fileName") != null ? dto.get("fileName").toString() : ("doc-" + documentId);
        result.put("fileName", fileName);

        // simple mimeType guess
        String lower = fileName.toLowerCase();
        String mimeType = "application/pdf";
        if (lower.endsWith(".png")) mimeType = "image/png";
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
        else if (lower.endsWith(".webp")) mimeType = "image/webp";
        else if (lower.endsWith(".gif")) mimeType = "image/gif";
        else if (lower.endsWith(".txt")) mimeType = "text/plain";
        result.put("mimeType", mimeType);

        // 🔹 s3Link here is the SIGNED URL from DocumentController
        if (signedUrl != null && !signedUrl.isBlank()) {
            result.put("s3Link", signedUrl);
        } else {
            // fallback: stored filePath (plain S3 URL) if signed URL not available
            result.put("s3Link", dto.get("filePath"));
        }

        return result;
    }

    /**
     * Download raw bytes from given URL (signed URL or plain S3 URL).
     */
    public byte[] downloadDocumentBytes(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return new byte[0];
        }
        try {
            // Ensure full signed URL (with query params) is used as-is
            URI uri = new URI(fileUrl);

            ResponseEntity<byte[]> resp = restTemplate.getForEntity(uri, byte[].class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return resp.getBody();
            }
        } catch (HttpClientErrorException e) {
            // log if needed
        } catch (Exception e) {
            // log if needed
        }
        return new byte[0];
    }



    /**
     * Register merged chargesheet PDF as a new Document in Document Service.
     * Uses POST /api/documents with a DocumentDto-compatible JSON body.
     */
    public Map createDocumentRecord(Map<String,Object> request){
        String url = documentServiceBase;

        Map<String, Object> body = new HashMap<>();
        body.put("fileName", request.get("fileName"));
        body.put("filePath", request.get("s3Link")); // stable S3 URL from s3MockService
        body.put("linkedTo", request.getOrDefault("linkedTo", "CHARGESHEET"));
        body.put("linkId", request.get("linkId"));

        Long createdBy = request.get("createdBy") != null
                ? Long.parseLong(request.get("createdBy").toString())
                : 1L;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        body.put("uploadedBy", createdBy);
        body.put("uploadedOn", now);
        body.put("createdBy", createdBy);
        body.put("createdOn", now);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
        return resp.getBody();
    }
}

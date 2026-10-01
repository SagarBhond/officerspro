package com.configserver.chargesheet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.Map;

@Service
public class DocumentUploadClient {

    private final RestTemplate restTemplate = new RestTemplate();

    // Base for document service (WITHOUT /upload at the end)
    // e.g. http://localhost:8085/api/documents
    @Value("${external.document-service:http://localhost:8085/api/documents}")
    private String documentServiceBase;

    /**
     * Upload merged PDF bytes to Document Service /upload and return response map.
     * Response contains fields like: documentId, fileName, s3Key, message.
     */
    public Map<String, Object> uploadMergedPdf(byte[] pdfBytes,
                                               String fileName,
                                               String linkedTo,
                                               String linkId,
                                               Long uploadedBy) {

        String url = documentServiceBase + "/upload";

        // 1) Build Multipart file part
        ByteArrayResource fileResource = new ByteArrayResource(pdfBytes) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };

        // 2) Multipart/form-data body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("linkedTo", linkedTo);
        if (linkId != null) {
            body.add("linkId", linkId);
        }
        if (uploadedBy != null) {
            body.add("uploadedBy", uploadedBy.toString());
        }

        // 3) Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        // 4) Call Document /upload
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, requestEntity, Map.class);
        return resp.getBody() != null ? resp.getBody() : new HashMap<>();
    }
}

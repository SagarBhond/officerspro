package com.configserver.chargesheet.service;

import com.configserver.chargesheet.dto.*;
import com.configserver.chargesheet.entity.*;
import com.configserver.chargesheet.feign.CourtCaseServiceClient;
import com.configserver.chargesheet.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChargesheetService {

    private static final Logger log = LoggerFactory.getLogger(ChargesheetService.class);

    @Autowired
    private FerristMasterRepository ferristMasterRepository;

    @Autowired
    private FerristDocumentRepository ferristDocumentRepository;

    @Autowired
    private ChargesheetMasterRepository chargesheetMasterRepository;

    @Autowired
    private ChargesheetDocumentRepository chargesheetDocumentRepository;

    @Autowired
    private ExternalDataService externalDataService;

    @Autowired
    private PdfGenerationService pdfGenerationService;

    @Autowired
    private S3MockService s3MockService;

    @Autowired
    private DocumentUploadClient documentUploadClient;
    
    @Autowired
    private CourtCaseServiceClient courtCaseServiceClient;

    private static class BuiltChargesheet {
        byte[] mergedPdf;
        List<ChargesheetResponse.IndexEntry> indexEntries;
        int totalPages;

        BuiltChargesheet(byte[] mergedPdf,
                         List<ChargesheetResponse.IndexEntry> indexEntries,
                         int totalPages) {
            this.mergedPdf = mergedPdf;
            this.indexEntries = indexEntries;
            this.totalPages = totalPages;
        }
    }

    private BuiltChargesheet buildChargesheetPdf(ChargesheetCreateRequest req,
                                                 FerristMaster fm,
                                                 boolean allowUnfinalized) throws Exception {
        if (!allowUnfinalized && !Boolean.TRUE.equals(fm.getIsFinalized())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ferrist must be finalized to create chargesheet");
        }

        Map<String, Object> fir = externalDataService.getFir(req.getFirId());
        List<FerristDocument> activeDocs =
                ferristDocumentRepository.findActiveLatestByFerristIdOrderBySequenceNumber(req.getFerristId());

        List<byte[]> pdfParts = new ArrayList<>();
        List<ChargesheetResponse.IndexEntry> indexEntries = new ArrayList<>();

        int indexPageCountPlaceholder = 1;
        int currentPage = indexPageCountPlaceholder + 1;

        for (int i = 0; i < activeDocs.size(); i++) {
            FerristDocument fd = activeDocs.get(i);
            Map<String, Object> docMeta = externalDataService.getDocumentMetadata(fd.getDocumentId());
            String mimeType = docMeta.getOrDefault("mimeType", "application/pdf").toString();
            String s3Link = docMeta.getOrDefault("s3Link", "").toString();
            String fileName = fd.getDescription();

            Integer pageCount = null;
            if (docMeta.get("pageCount") != null) {
                pageCount = Integer.parseInt(docMeta.get("pageCount").toString());
            }

            byte[] raw = externalDataService.downloadDocumentBytes(s3Link);
            byte[] pdfBytes = pdfGenerationService.convertToPdfIfNeeded(raw, mimeType);
            pdfParts.add(pdfBytes);

            if (pageCount == null || pageCount == 0) {
                try (com.lowagie.text.pdf.PdfReader r = new com.lowagie.text.pdf.PdfReader(pdfBytes)) {
                    pageCount = r.getNumberOfPages();
                } catch (Exception ex) {
                    pageCount = 1;
                }
            }

            int start = currentPage;
            int end = start + pageCount - 1;

            indexEntries.add(ChargesheetResponse.IndexEntry.builder()
                    .sequenceNo(i + 1)
                    .documentName(fileName)
                    .startPage(start)
                    .endPage(end)
                    .build());

            currentPage = end + 1;
        }

        List<String[]> indexRows = new ArrayList<>();
        for (ChargesheetResponse.IndexEntry ie : indexEntries) {
            indexRows.add(new String[]{
                    ie.getDocumentName(),
                    String.valueOf(ie.getStartPage())
            });
        }

        byte[] indexPage = pdfGenerationService.createIndexPage(indexRows);
        pdfParts.add(0, indexPage);

        // recalc index pages just for completeness (not strictly needed for ranges)
        int totalPages = currentPage - 1;

        byte[] merged = pdfGenerationService.mergeWithPageNumbers(pdfParts);

        return new BuiltChargesheet(merged, indexEntries, totalPages);
    }

    @Transactional
    public ChargesheetResponse createChargesheet(ChargesheetCreateRequest req) throws Exception {
        FerristMaster fm = ferristMasterRepository.findById(req.getFerristId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferrist not found"));

        // build merged PDF + index using shared logic (requires finalized = false here, we enforce below)
        BuiltChargesheet built = buildChargesheetPdf(req, fm, false);
        byte[] merged = built.mergedPdf;
        List<ChargesheetResponse.IndexEntry> indexEntries = built.indexEntries;
        int totalPages = built.totalPages;

        // 1) Upload merged PDF to live Document Service
        String mergedFileName = String.format("ChargeSheet_%s.pdf", req.getFerristId());

        Long createdBy = req.getCreatedBy() != null
                ? req.getCreatedBy().longValue()
                : 1L;

        Map<String, Object> uploadResp = documentUploadClient.uploadMergedPdf(
                merged,
                mergedFileName,
                "CHARGESHEET",
                req.getFerristId(),
                createdBy
        );

        Long createdDocumentId;
        Object docIdVal = uploadResp.get("documentId");
        if (docIdVal != null) {
            createdDocumentId = Long.parseLong(docIdVal.toString());
        } else {
            createdDocumentId = System.currentTimeMillis();
        }

        String s3Link = uploadResp.get("s3Key") != null
                ? uploadResp.get("s3Key").toString()
                : "";

        Map<String, Object> docReq = new HashMap<>();
        docReq.put("fileName", mergedFileName);
        docReq.put("mimeType", "application/pdf");
        docReq.put("s3Link", s3Link);
        docReq.put("sizeBytes", merged.length);
        docReq.put("linkedTo", "CHARGESHEET");
        docReq.put("linkId", req.getFerristId());
        docReq.put("createdBy", req.getCreatedBy());
        Map createdDoc = externalDataService.createDocumentRecord(docReq);

        createdDocumentId = null;
        if (createdDoc != null && createdDoc.get("id") != null) {
            createdDocumentId = Long.parseLong(createdDoc.get("id").toString());
        } else if (createdDoc != null && createdDoc.get("documentId") != null) {
            createdDocumentId = Long.parseLong(createdDoc.get("documentId").toString());
        } else {
            createdDocumentId = System.currentTimeMillis();
        }

        int version = fm.getVersionNumber();
        String chargesheetId = String.format("CS-%s-%s-V%d",
                extractStateFromId(fm.getFerristId()),
                generateShortId(),
                version);

        ChargesheetMaster csm = ChargesheetMaster.builder()
                .chargesheetId(chargesheetId)
                .ferristId(req.getFerristId())
                .caseId(fm.getCaseId())
                .firId(req.getFirId())
                .investigationId(fm.getInvestigationId())
                .versionNumber(version)
                .isSubmitted(false)
                .courtName(req.getCourtName())
                .remarks(req.getRemarks())
                .createdBy(req.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();
        chargesheetMasterRepository.save(csm);

        ChargesheetDocument csDoc = ChargesheetDocument.builder()
                .chargesheetId(chargesheetId)
                .documentId(createdDocumentId)
                .documentType(ChargesheetDocument.DocumentType.MERGED_FINAL_PDF)
                .createdBy(req.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();
        chargesheetDocumentRepository.save(csDoc);

        fm.setIsConvertedToChargesheet(true);
        fm.setChargesheetId(chargesheetId);
        ferristMasterRepository.save(fm);

        ChargesheetResponse.DocumentInfo mergedDocInfo = ChargesheetResponse.DocumentInfo.builder()
                .documentId(createdDocumentId)
                .fileName(mergedFileName)
                .mimeType("application/pdf")
                .pageCount(totalPages)
                .s3Link(s3Link)
                .sizeBytes((long) merged.length)
                .build();

        return ChargesheetResponse.builder()
                .chargesheetId(chargesheetId)
                .ferristId(req.getFerristId())
                .versionNumber(version)
                .courtName(req.getCourtName())
                .isSubmitted(false)
                .remarks(req.getRemarks())
                .createdAt(LocalDateTime.now())
                .mergedDocument(mergedDocInfo)
                .indexEntries(indexEntries)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] previewChargesheet(ChargesheetCreateRequest req) throws Exception {
        FerristMaster fm = ferristMasterRepository.findById(req.getFerristId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferrist not found"));

        BuiltChargesheet built = buildChargesheetPdf(req, fm, true); // allow unfinalized
        return built.mergedPdf;
    }


    private String extractStateFromId(String ferristId){
        if (ferristId == null) return "MH";
        String[] parts = ferristId.split("-");
        if (parts.length >= 3) return parts[1];
        return "MH";
    }

    private String generateShortId(){
        return UUID.randomUUID().toString().substring(0,8).toUpperCase();
    }

    @Transactional
    public ChargesheetMaster submitChargesheet(ChargesheetSubmitRequest req){
        ChargesheetMaster cs = chargesheetMasterRepository.findById(req.getChargesheetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chargesheet not found"));
        cs.setIsSubmitted(true);
        cs.setSubmittedBy(req.getSubmittedBy());
        cs.setSubmittedAt(java.time.LocalDateTime.now());
        cs.setHearingDate(req.getHearingDate());
        cs.setCourtName(req.getCourtName());
        cs.setRemarks(req.getRemarks());
        ChargesheetMaster saved = chargesheetMasterRepository.save(cs);
        
        // Notify court case service to auto-create/update court case
        try {
            com.configserver.chargesheet.dto.ChargesheetSubmissionDto dto = 
                new com.configserver.chargesheet.dto.ChargesheetSubmissionDto(
                    saved.getChargesheetId(),
                    saved.getFirId(),
                    saved.getFerristId()
                );
            courtCaseServiceClient.notifyChargesheetSubmission(dto);
            log.info("Successfully notified court case service for chargesheet: {}", saved.getChargesheetId());
        } catch (Exception e) {
            log.error("Failed to notify court case service, but chargesheet submitted successfully", e);
            // Don't fail the submission if notification fails
        }
        
        return saved;
    }


    @Transactional(readOnly = true)
    public List<ChargesheetMaster> getAllChargesheetsFiltered(
            String caseId,
            String firId,
            String ferristId,
            String investigationId,
            Boolean isSubmitted,
            String courtName,
            String fromDate,
            String toDate,
            String sortBy,
            String order
    ) {
        List<ChargesheetMaster> all = chargesheetMasterRepository.findAll();
        Stream<ChargesheetMaster> stream = all.stream();

        // ✅ Filter by Case ID
        if (caseId != null && !caseId.isBlank()) {
            stream = stream.filter(cs -> caseId.equalsIgnoreCase(cs.getCaseId()));
        }

        // ✅ Filter by FIR ID
        if (firId != null && !firId.isBlank()) {
            stream = stream.filter(cs -> firId.equalsIgnoreCase(cs.getFirId()));
        }

        // ✅ Filter by Ferrist ID
        if (ferristId != null && !ferristId.isBlank()) {
            stream = stream.filter(cs -> ferristId.equalsIgnoreCase(cs.getFerristId()));
        }

        // ✅ Filter by Investigation ID
        if (investigationId != null && !investigationId.isBlank()) {
            stream = stream.filter(cs -> investigationId.equalsIgnoreCase(cs.getInvestigationId()));
        }

        // ✅ Filter by Submission Status
        if (isSubmitted != null) {
            stream = stream.filter(cs -> Boolean.TRUE.equals(cs.getIsSubmitted()) == isSubmitted);
        }

        // ✅ Filter by Court Name
        if (courtName != null && !courtName.isBlank()) {
            stream = stream.filter(cs -> cs.getCourtName() != null && cs.getCourtName().equalsIgnoreCase(courtName));
        }

        // ✅ Filter by Date Range
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        LocalDateTime from = (fromDate != null && !fromDate.isBlank())
                ? LocalDateTime.parse(fromDate, formatter)
                : LocalDateTime.MIN;
        LocalDateTime to = (toDate != null && !toDate.isBlank())
                ? LocalDateTime.parse(toDate, formatter)
                : LocalDateTime.MAX;

        stream = stream.filter(cs -> {
            LocalDateTime createdAt = cs.getCreatedAt();
            return createdAt != null && !createdAt.isBefore(from) && !createdAt.isAfter(to);
        });

        // ✅ Sorting (by createdAt or submittedAt)
        Comparator<ChargesheetMaster> comparator;
        if ("submittedAt".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(ChargesheetMaster::getSubmittedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        } else if ("hearingDate".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(ChargesheetMaster::getHearingDate, Comparator.nullsLast(Comparator.naturalOrder()));
        } else {
            comparator = Comparator.comparing(ChargesheetMaster::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        }

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }

        return stream.sorted(comparator).toList();
    }

    @Transactional(readOnly = true)
    public Long getMergedDocumentIdByChargesheetId(String chargesheetId) {
        ChargesheetDocument csDoc = chargesheetDocumentRepository
                .findFirstByChargesheetIdAndDocumentType(
                        chargesheetId,
                        ChargesheetDocument.DocumentType.MERGED_FINAL_PDF
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Merged chargesheet document not found"
                ));
        return csDoc.getDocumentId();
    }

    @Transactional(readOnly = true)
    public ChargesheetMaster getChargesheetById(String chargesheetId) {
        return chargesheetMasterRepository.findById(chargesheetId).orElse(null);
    }


}

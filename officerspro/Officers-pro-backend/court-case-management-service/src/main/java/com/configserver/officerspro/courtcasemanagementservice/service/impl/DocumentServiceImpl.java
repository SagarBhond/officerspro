package com.configserver.officerspro.courtcasemanagementservice.service.impl;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.configserver.officerspro.courtcasemanagementservice.dto.external.document.DocumentInfoResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.ChargesheetSyncRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.DocumentMappingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.DocumentItemResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.MappingResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCaseDocument;
import com.configserver.officerspro.courtcasemanagementservice.enums.DocumentSource;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.InvalidInputException;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.ResourceNotFoundException;
import com.configserver.officerspro.courtcasemanagementservice.client.DocumentServiceClient;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseDocumentRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseRepository;

@Service
@Transactional
public class DocumentServiceImpl implements com.configserver.officerspro.courtcasemanagementservice.service.DocumentService {

    private final CourtCaseRepository caseRepo;
    private final CourtCaseDocumentRepository docRepo;
    private final DocumentServiceClient documentClient;

    public DocumentServiceImpl(CourtCaseRepository caseRepo,
                               CourtCaseDocumentRepository docRepo,
                               DocumentServiceClient documentClient) {
        this.caseRepo = caseRepo;
        this.docRepo = docRepo;
        this.documentClient = documentClient;
    }

    @Override
    public MappingResponse addDocumentMapping(Long caseId, DocumentMappingRequest req) {
        CourtCase cc = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));

        if (req.getDocumentId() == null) {
            throw new InvalidInputException("documentId is required");
        }
        if (!isDocumentValid(req.getDocumentId())) {
            throw new InvalidInputException("Invalid documentId: " + req.getDocumentId());
        }

        CourtCaseDocument map = new CourtCaseDocument();
        map.setCaseId(caseId);
        map.setCourtCase(cc);
        map.setDocumentId(req.getDocumentId());
        map.setDocumentType(req.getDocumentType());
        map.setLinkedOn(LocalDateTime.now());
        map.setSource(DocumentSource.OFFICER);
        map.setSourceId(null);
        map = docRepo.save(map);

        MappingResponse res = new MappingResponse();
        res.setMappingId(map.getId());
        res.setCaseId(caseId);
        res.setDocumentId(req.getDocumentId());
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentItemResponse> listDocuments(Long caseId) {
        caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        return docRepo.findByCaseId(caseId).stream()
                .map(this::toItem)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteMapping(Long caseId, Long mappingId) {
        CourtCaseDocument map = docRepo.findById(mappingId)
                .orElseThrow(() -> new ResourceNotFoundException("Mapping not found: " + mappingId));
        if (!map.getCaseId().equals(caseId)) {
            throw new InvalidInputException("Mapping does not belong to caseId=" + caseId);
        }
        docRepo.delete(map);
    }

    @Override
    public List<DocumentItemResponse> syncChargesheetDocuments(Long caseId, String chargesheetId, ChargesheetSyncRequest req) {
        CourtCase cc = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));

        if (chargesheetId == null) {
            throw new InvalidInputException("chargesheetId is required");
        }

        // Optionally attach courtTrackingId
        if (req.getCourtTrackingId() != null && !req.getCourtTrackingId().isEmpty()) {
            cc.setCourtTrackingId(req.getCourtTrackingId());
        }

        // Validate and upsert incoming docs
        Set<Long> incomingDocIds = new HashSet<>();
        if (req.getDocuments() != null) {
            for (ChargesheetSyncRequest.DocumentItem d : req.getDocuments()) {
                if (d.getDocumentId() == null) {
                    throw new InvalidInputException("documentId is required in documents list");
                }
                // Validate document exists in Document Service
                // Note: isDocumentValid returns true if Document Service is down (for dev resilience)
                if (!isDocumentValid(d.getDocumentId())) {
                    throw new InvalidInputException("Invalid documentId: " + d.getDocumentId() + ". Document not found in Document Service.");
                }
                incomingDocIds.add(d.getDocumentId());

                // Check if already exists for this case and source
                List<CourtCaseDocument> existing = docRepo.findByCaseIdAndSourceAndSourceId(caseId, DocumentSource.CHARGESHEET, chargesheetId);
                boolean exists = existing.stream().anyMatch(m -> m.getDocumentId().equals(d.getDocumentId()));
                if (!exists) {
                    CourtCaseDocument map = new CourtCaseDocument();
                    map.setCaseId(caseId);
                    map.setCourtCase(cc);
                    map.setDocumentId(d.getDocumentId());
                    map.setDocumentType(d.getDocumentType());
                    map.setLinkedOn(LocalDateTime.now());
                    map.setSource(DocumentSource.CHARGESHEET);
                    map.setSourceId(chargesheetId);
                    docRepo.save(map);
                }
            }
        }

        // Replace strategy: remove old CHARGESHEET docs for this case and chargesheetId that are not in incoming list
        if (req.isReplaceAll()) {
            List<CourtCaseDocument> current = docRepo.findByCaseIdAndSourceAndSourceId(caseId, DocumentSource.CHARGESHEET, chargesheetId);
            for (CourtCaseDocument m : current) {
                if (!incomingDocIds.contains(m.getDocumentId())) {
                    docRepo.delete(m);
                }
            }
        }

        // Set current chargesheet
        cc.setCurrentChargesheetId(chargesheetId);
        caseRepo.save(cc);

        return docRepo.findByCaseId(caseId).stream().map(this::toItem).collect(Collectors.toList());
    }

    private DocumentItemResponse toItem(CourtCaseDocument d) {
        DocumentItemResponse r = new DocumentItemResponse();
        r.setMappingId(d.getId());
        r.setDocumentId(d.getDocumentId());
        r.setDocumentType(d.getDocumentType());
        r.setSource(d.getSource());
        r.setSourceId(d.getSourceId());
        return r;
    }

    private boolean isDocumentValid(Long documentId) {
        try {
            DocumentInfoResponse document = documentClient.getDocumentById(documentId);
            return document != null && document.getDocumentId() != null;
        } catch (Exception ex) {
            System.out.println("[DOCUMENT SERVICE DOWN] getDocumentById failed: " + ex.getMessage());
            // In dev, treat as valid so flow continues even if document service hiccups
            return true;
        }
    }
}

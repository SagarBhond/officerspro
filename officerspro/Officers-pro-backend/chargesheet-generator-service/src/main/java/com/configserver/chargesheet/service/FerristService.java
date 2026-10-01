package com.configserver.chargesheet.service;

import com.configserver.chargesheet.dto.*;
import com.configserver.chargesheet.entity.FerristDocument;
import com.configserver.chargesheet.entity.FerristMaster;
import com.configserver.chargesheet.repository.FerristDocumentRepository;
import com.configserver.chargesheet.repository.FerristMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.stream.Stream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FerristService {

    @Autowired
    private FerristMasterRepository ferristMasterRepository;

    @Autowired
    private FerristDocumentRepository ferristDocumentRepository;

    @Autowired
    private ExternalDataService externalDataService;

    /**
     * Create first Ferrist (V1) from investigation
     */
    @Transactional
    public FerristMaster createFromInvestigation(FerristCreateRequest req) {
        // ✅ Hyphen-based ID format
        String ferristId = String.format("FR-%s-%s-V1", extractStateCode(req.getCaseId()), generateShortId());
        FerristMaster fm = FerristMaster.builder()
                .ferristId(ferristId)
                .caseId(req.getCaseId())
                .firId(req.getFirId())
                .investigationId(req.getInvestigationId())
                .versionNumber(1)
                .isFinalized(false)
                .isConvertedToChargesheet(false)
                .createdBy(req.getCreatedBy())
                .remarks(req.getRemarks())
                .createdAt(java.time.LocalDateTime.now())
                .build();
        return ferristMasterRepository.save(fm);
    }

    private String extractStateCode(String caseId){
        if (caseId == null) return "MH";
        if (caseId.contains("-")) {
            String[] parts = caseId.split("-");
            if (parts.length >= 3) return parts[2];
        }
        return "MH";
    }

    private String generateShortId(){
        return UUID.randomUUID().toString().substring(0,8).toUpperCase();
    }

    /**
     * Create new version from finalized parent
     */
    @Transactional
    public FerristMaster createVersion(FerristVersionCreateRequest req) {
        FerristMaster prev = ferristMasterRepository.findById(req.getPreviousFerristId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Previous ferrist not found"));
        if (!Boolean.TRUE.equals(prev.getIsFinalized())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Previous ferrist must be finalized to create new version");
        }

        Integer newVer = prev.getVersionNumber() + 1;
        String newFerristId = prev.getFerristId()
                .replace("-V" + prev.getVersionNumber(), "-V" + newVer);

        FerristMaster newFm = FerristMaster.builder()
                .ferristId(newFerristId)
                .caseId(prev.getCaseId())
                .firId(prev.getFirId())
                .investigationId(prev.getInvestigationId())
                .versionNumber(newVer)
                .isFinalized(false)
                .isConvertedToChargesheet(false)
                .createdBy(req.getCreatedBy())
                .remarks(req.getRemarks())
                .createdAt(LocalDateTime.now())
                .build();
        ferristMasterRepository.save(newFm);

        // clone active documents as RESTORED rows, preserving description
        List<FerristDocument> active =
                ferristDocumentRepository.findActiveLatestByFerristIdOrderBySequenceNumber(req.getPreviousFerristId());

        List<FerristDocument> toInsert = new ArrayList<>();
        for (FerristDocument a : active) {
            FerristDocument r = FerristDocument.builder()
                    .ferristId(newFerristId)
                    .documentId(a.getDocumentId())
                    .sequenceNumber(a.getSequenceNumber())
                    .actionType(FerristDocument.ActionType.RESTORED)
                    .isActive(true)
                    .createdBy(req.getCreatedBy())
                    .description(a.getDescription())                 // keep description
                    .remarks("Restored from finalized Ferrist")
                    .createdAt(LocalDateTime.now())
                    .build();
            toInsert.add(r);
        }
        ferristDocumentRepository.saveAll(toInsert);
        return newFm;
    }


    public FerristMaster getFerrist(String ferristId){
        return ferristMasterRepository.findById(ferristId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferrist not found"));
    }

    public List<FerristDocument> getActiveDocuments(String ferristId){
        return ferristDocumentRepository.findActiveLatestByFerristIdOrderBySequenceNumber(ferristId);
    }

    @Transactional
    public FerristDocument addDocument(String ferristId, AddDocumentRequest req) {
        FerristMaster fm = getFerrist(ferristId);
        if (Boolean.TRUE.equals(fm.getIsFinalized())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ferrist finalized. Cannot modify.");
        }

        List<FerristDocument> current = getActiveDocuments(ferristId);
        List<Long> currentIds = current.stream()
                .map(FerristDocument::getDocumentId)
                .collect(Collectors.toList());
        if (currentIds.contains(req.getDocumentId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Document already present");
        }

        // description of already-present docs
        Map<Long, String> descByDocId = current.stream()
                .collect(Collectors.toMap(
                        FerristDocument::getDocumentId,
                        FerristDocument::getDescription,
                        (a, b) -> a
                ));

        int idx = currentIds.size();
        if (req.getPosition() != null) {
            idx = Math.max(0, Math.min(req.getPosition() - 1, currentIds.size()));
        } else if (req.getInsertAfterDocumentId() != null) {
            int pos = currentIds.indexOf(req.getInsertAfterDocumentId());
            idx = pos >= 0 ? pos + 1 : currentIds.size();
        }
        List<Long> newOrder = new ArrayList<>(currentIds);
        newOrder.add(idx, req.getDocumentId());

        List<FerristDocument> toInsert = new ArrayList<>();
        for (int i = 0; i < newOrder.size(); i++) {
            Long docId = newOrder.get(i);
            FerristDocument.ActionType action =
                    docId.equals(req.getDocumentId())
                            ? FerristDocument.ActionType.ADDED
                            : FerristDocument.ActionType.REORDERED;

            String desc = docId.equals(req.getDocumentId())
                    ? req.getDescription()              // description for new doc
                    : descByDocId.get(docId);           // keep existing desc

            FerristDocument fd = FerristDocument.builder()
                    .ferristId(ferristId)
                    .documentId(docId)
                    .sequenceNumber(i + 1)
                    .actionType(action)
                    .isActive(true)
                    .createdBy(req.getAddedBy())
                    .description(desc)
                    .remarks(req.getRemarks())
                    .createdAt(LocalDateTime.now())
                    .build();
            toInsert.add(fd);
        }
        ferristDocumentRepository.saveAll(toInsert);
        return toInsert.stream()
                .filter(x -> x.getActionType() == FerristDocument.ActionType.ADDED)
                .findFirst()
                .orElse(null);
    }



    @Transactional
    public void removeDocument(String ferristId, Long documentId, Integer removedBy, String remarks) {
        FerristMaster fm = getFerrist(ferristId);
        if (Boolean.TRUE.equals(fm.getIsFinalized())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ferrist finalized. Cannot modify.");
        }

        List<FerristDocument> current = getActiveDocuments(ferristId);
        List<Long> currentIds = current.stream()
                .map(FerristDocument::getDocumentId)
                .collect(Collectors.toList());
        if (!currentIds.contains(documentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not active in ferrist");
        }

        Optional<FerristDocument> last =
                ferristDocumentRepository.findTopByFerristIdAndDocumentIdOrderByCreatedAtDesc(ferristId, documentId);
        Integer seq = last.map(FerristDocument::getSequenceNumber).orElse(null);
        FerristDocument lastDoc = last.orElse(null);

        // soft delete entry, keep description in history
        FerristDocument deleted = FerristDocument.builder()
                .ferristId(ferristId)
                .documentId(documentId)
                .sequenceNumber(seq)
                .actionType(FerristDocument.ActionType.DELETED)
                .isActive(false)
                .createdBy(removedBy)
                .description(lastDoc != null ? lastDoc.getDescription() : null)
                .remarks(remarks)
                .createdAt(LocalDateTime.now())
                .build();
        ferristDocumentRepository.save(deleted);

        // resequence remaining docs, preserving description
        List<Long> newOrder = currentIds.stream()
                .filter(id -> !id.equals(documentId))
                .collect(Collectors.toList());

        Map<Long, String> descByDocId = current.stream()
                .collect(Collectors.toMap(
                        FerristDocument::getDocumentId,
                        FerristDocument::getDescription,
                        (a, b) -> a
                ));

        List<FerristDocument> toInsert = new ArrayList<>();
        for (int i = 0; i < newOrder.size(); i++) {
            Long docId = newOrder.get(i);
            FerristDocument fd = FerristDocument.builder()
                    .ferristId(ferristId)
                    .documentId(docId)
                    .sequenceNumber(i + 1)
                    .actionType(FerristDocument.ActionType.REORDERED)
                    .isActive(true)
                    .createdBy(removedBy)
                    .description(descByDocId.get(docId))          // NEW
                    .remarks("Resequence after removal")
                    .createdAt(LocalDateTime.now())
                    .build();
            toInsert.add(fd);
        }
        ferristDocumentRepository.saveAll(toInsert);
    }


    @Transactional
    public FerristDocument restoreDocument(String ferristId,
                                           Long documentId,
                                           Integer restoredBy,
                                           Integer position,
                                           String remarks) {
        FerristMaster fm = getFerrist(ferristId);
        if (Boolean.TRUE.equals(fm.getIsFinalized())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ferrist finalized. Cannot modify.");
        }

        List<FerristDocument> current = getActiveDocuments(ferristId);
        List<Long> currentIds = current.stream()
                .map(FerristDocument::getDocumentId)
                .collect(Collectors.toList());
        if (currentIds.contains(documentId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Document already active");
        }

        int idx = currentIds.size();
        if (position != null) idx = Math.max(0, Math.min(position - 1, currentIds.size()));
        List<Long> newOrder = new ArrayList<>(currentIds);
        newOrder.add(idx, documentId);

        Optional<FerristDocument> last =
                ferristDocumentRepository.findTopByFerristIdAndDocumentIdOrderByCreatedAtDesc(ferristId, documentId);
        String restoredDesc = last.map(FerristDocument::getDescription).orElse(null);

        Map<Long, String> descByDocId = current.stream()
                .collect(Collectors.toMap(
                        FerristDocument::getDocumentId,
                        FerristDocument::getDescription,
                        (a, b) -> a
                ));

        List<FerristDocument> toInsert = new ArrayList<>();
        for (int i = 0; i < newOrder.size(); i++) {
            Long docId = newOrder.get(i);
            FerristDocument.ActionType action =
                    docId.equals(documentId)
                            ? FerristDocument.ActionType.RESTORED
                            : FerristDocument.ActionType.REORDERED;

            String desc = docId.equals(documentId)
                    ? restoredDesc
                    : descByDocId.get(docId);

            FerristDocument fd = FerristDocument.builder()
                    .ferristId(ferristId)
                    .documentId(docId)
                    .sequenceNumber(i + 1)
                    .actionType(action)
                    .isActive(true)
                    .createdBy(restoredBy)
                    .description(desc)                     // NEW
                    .remarks(remarks)
                    .createdAt(LocalDateTime.now())
                    .build();
            toInsert.add(fd);
        }
        ferristDocumentRepository.saveAll(toInsert);

        return toInsert.stream()
                .filter(x -> x.getActionType() == FerristDocument.ActionType.RESTORED)
                .findFirst()
                .orElse(null);
    }


    @Transactional
    public List<FerristDocument> reorder(String ferristId, ReorderRequest req) {
        FerristMaster fm = getFerrist(ferristId);
        if (Boolean.TRUE.equals(fm.getIsFinalized())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ferrist finalized. Cannot modify.");
        }

        List<Long> provided = req.getNewOrder().stream()
                .map(ReorderRequest.OrderItem::getDocumentId)
                .collect(Collectors.toList());

        List<FerristDocument> current = getActiveDocuments(ferristId);
        List<Long> currentIds = current.stream()
                .map(FerristDocument::getDocumentId)
                .sorted()
                .collect(Collectors.toList());

        List<Long> provSorted = provided.stream().sorted().collect(Collectors.toList());
        if (!currentIds.equals(provSorted)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "newOrder must contain exactly current active documents");
        }

        Map<Long, String> descByDocId = current.stream()
                .collect(Collectors.toMap(
                        FerristDocument::getDocumentId,
                        FerristDocument::getDescription,
                        (a, b) -> a
                ));

        List<FerristDocument> toInsert = new ArrayList<>();
        for (int i = 0; i < provided.size(); i++) {
            Long docId = provided.get(i);
            FerristDocument fd = FerristDocument.builder()
                    .ferristId(ferristId)
                    .documentId(docId)
                    .sequenceNumber(i + 1)
                    .actionType(FerristDocument.ActionType.REORDERED)
                    .isActive(true)
                    .createdBy(req.getUpdatedBy())
                    .description(descByDocId.get(docId))      // NEW
                    .remarks(req.getRemarks())
                    .createdAt(LocalDateTime.now())
                    .build();
            toInsert.add(fd);
        }
        ferristDocumentRepository.saveAll(toInsert);
        return toInsert;
    }


    @Transactional
    public FerristMaster finalizeFerrist(String ferristId, Integer finalizedBy, String remarks){
        FerristMaster fm = getFerrist(ferristId);
        fm.setIsFinalized(true);
        fm.setUpdatedBy(finalizedBy);
        fm.setUpdatedAt(java.time.LocalDateTime.now());
        fm.setRemarks(remarks);
        return ferristMasterRepository.save(fm);
    }

    @Transactional(readOnly = true)
    public List<FerristMaster> getAllFerristsFiltered(
            String caseId,
            String firId,
            String investigationId,
            String fromDate,
            String toDate,
            Boolean isFinalized,
            String sortBy,
            String order) {

        List<FerristMaster> all = ferristMasterRepository.findAll();
        Stream<FerristMaster> stream = all.stream();

        // ✅ Filter by Case ID
        if (caseId != null && !caseId.isBlank()) {
            stream = stream.filter(f -> f.getCaseId() != null && f.getCaseId().equalsIgnoreCase(caseId));
        }

        // ✅ Filter by FIR ID
        if (firId != null && !firId.isBlank()) {
            stream = stream.filter(f -> f.getFirId() != null && f.getFirId().equalsIgnoreCase(firId));
        }

        // ✅ Filter by Investigation ID
        if (investigationId != null && !investigationId.isBlank()) {
            stream = stream.filter(f -> f.getInvestigationId() != null && f.getInvestigationId().equalsIgnoreCase(investigationId));
        }

        // ✅ Filter by Finalized status
        if (isFinalized != null) {
            stream = stream.filter(f -> Boolean.TRUE.equals(f.getIsFinalized()) == isFinalized);
        }

        // ✅ Date range filter
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        LocalDateTime from = (fromDate != null && !fromDate.isBlank())
                ? LocalDateTime.parse(fromDate, formatter)
                : LocalDateTime.MIN;
        LocalDateTime to = (toDate != null && !toDate.isBlank())
                ? LocalDateTime.parse(toDate, formatter)
                : LocalDateTime.MAX;

        stream = stream.filter(f -> {
            LocalDateTime createdAt = f.getCreatedAt();
            return createdAt != null && !createdAt.isBefore(from) && !createdAt.isAfter(to);
        });

        // ✅ Sorting
        Comparator<FerristMaster> comparator;
        if ("updatedAt".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(FerristMaster::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        } else {
            comparator = Comparator.comparing(FerristMaster::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        }

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }

        return stream.sorted(comparator).toList();
    }


}

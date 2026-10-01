package com.configserver.officerspro.investigationandcasediaryservice.service;


import com.configserver.officerspro.investigationandcasediaryservice.client.DocumentServiceClient;
import com.configserver.officerspro.investigationandcasediaryservice.client.FerristClient;
import com.configserver.officerspro.investigationandcasediaryservice.dto.AvailableEvidenceDocumentDTO;
import com.configserver.officerspro.investigationandcasediaryservice.dto.FerristDocumentDTO;
import com.configserver.officerspro.investigationandcasediaryservice.dto.FerristResponseDTO;
import com.configserver.officerspro.investigationandcasediaryservice.entity.Evidence;
import com.configserver.officerspro.investigationandcasediaryservice.entity.EvidenceDocument;
import com.configserver.officerspro.investigationandcasediaryservice.repository.EvidenceDocumentRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.EvidenceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvidenceDocumentQueryServiceImpl implements EvidenceDocumentQueryService {

    private final EvidenceRepository evidenceRepo;
    private final EvidenceDocumentRepository evidenceDocumentRepo;
    private final FerristClient ferristClient;
    private final DocumentServiceClient documentClient;


    @Override
    public List<AvailableEvidenceDocumentDTO> getAvailableEvidenceDocuments(
            String investigationId,
            String ferristId
    ) {
        // 1️⃣ Load all evidence for investigation
        List<Evidence> evidenceList = evidenceRepo.findByInvestigationId(investigationId);

        if (evidenceList.isEmpty()) return Collections.emptyList();

        List<Integer> evidenceIds = evidenceList.stream()
                .map(Evidence::getEvidenceId)
                .toList();

        // 2️⃣ Load all evidence documents
        List<EvidenceDocument> evidenceDocs = evidenceDocumentRepo.findByEvidenceIdIn(evidenceIds);

        Map<Integer, Evidence> evidenceMap = evidenceList.stream()
                .collect(Collectors.toMap(Evidence::getEvidenceId, e -> e));

        // 3️⃣ --- 🔥 UPDATED ONLY THIS SECTION 🔥 ---
        Set<Long> ferristDocIds = new HashSet<>();

        if (ferristId != null && !ferristId.isBlank()) {

            // NEW TYPE-SAFE FEIGN CALL
            FerristResponseDTO ferrist = ferristClient.getFerrist(ferristId);

            if (ferrist != null && ferrist.getDocuments() != null) {
                ferristDocIds = ferrist.getDocuments().stream()
                        .map(FerristDocumentDTO::getDocumentId)
                        .filter(Objects::nonNull)
                        .map(Long::valueOf)
                        .collect(Collectors.toSet());
            }
        }
        // -------------- END OF UPDATED PART -------------------

        List<AvailableEvidenceDocumentDTO> output = new ArrayList<>();

        // 4️⃣ Build DTO + fetch document metadata (NO CHANGE)
        for (EvidenceDocument ed : evidenceDocs) {

            if (ferristDocIds.contains(ed.getDocumentId().longValue())) {
                continue; // exclude used docs
            }

            Evidence ev = evidenceMap.get(ed.getEvidenceId());
            if (ev == null) continue;

            Map<String, Object> docMeta = documentClient.getDocumentMetadata(ed.getDocumentId().longValue());

            output.add(
                    AvailableEvidenceDocumentDTO.builder()
                            .evidenceDocumentId(ed.getEvidenceDocumentId())
                            .evidenceId(ev.getEvidenceId())
                            .investigationId(ev.getInvestigationId())
                            .documentId(Long.valueOf(ed.getDocumentId()))
                            .evidenceName(ev.getEvidenceName())
                            .description(ev.getDescription())
                            .evidenceType(ev.getEvidenceType())
                            .locationFound(ev.getLocationFound())
                            .collectedBy(ev.getCollectedBy())
                            .collectedOn(ev.getCollectedOn())
                            .fileType(ev.getFileType())
                            .filePath(ev.getFilePath())
                            .fileSize(ev.getFileSize())
                            .fileName((String) docMeta.get("fileName"))
                            .documentUrl((String) docMeta.get("filePath"))
                            .uploadedOn(
                                    docMeta.get("uploadedOn") != null
                                            ? LocalDateTime.parse(docMeta.get("uploadedOn").toString())
                                            : null
                            )
                            .build()
            );
        }

        return output;
    }

}

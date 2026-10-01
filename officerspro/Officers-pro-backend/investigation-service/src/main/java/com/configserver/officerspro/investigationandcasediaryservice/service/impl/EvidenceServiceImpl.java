package com.configserver.officerspro.investigationandcasediaryservice.service.impl;

import com.configserver.officerspro.investigationandcasediaryservice.client.DocumentServiceClient;
import com.configserver.officerspro.investigationandcasediaryservice.dto.*;
import com.configserver.officerspro.investigationandcasediaryservice.entity.*;
import com.configserver.officerspro.investigationandcasediaryservice.exception.*;
import com.configserver.officerspro.investigationandcasediaryservice.repository.DocumentRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.EvidenceDocumentRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.EvidenceRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.ForensicReportRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.PanchnamaRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.WitnessRepository;
import com.configserver.officerspro.investigationandcasediaryservice.service.EvidenceService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class EvidenceServiceImpl implements EvidenceService {

    private static final Logger logger = LoggerFactory.getLogger(
        EvidenceServiceImpl.class
    );

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EvidenceDocumentRepository evidenceDocumentRepository;

    @Autowired
    private ForensicReportRepository forensicReportRepository;

    @Autowired
    private PanchnamaRepository panchnamaRepository;

    @Autowired
    private WitnessRepository witnessRepository;

    // Removed unused UPLOAD_DIR as we're now using document service for file storage

    @Autowired
    private DocumentServiceClient documentServiceClient;

    @Override
    public Optional<EvidenceDTO> getEvidenceById(Integer evidenceId) {
        return evidenceRepository.findById(evidenceId).map(this::mapToDTO);
    }

    @Override
    public List<EvidenceDTO> getEvidenceByInvestigationId(
        String investigationId
    ) {
        logger.info("🔍 ===== GET EVIDENCE BY INVESTIGATION ID =====");
        logger.info("🔍 Querying evidence for investigation ID: {}", investigationId);
        
        try {
            if (investigationId == null || investigationId.trim().isEmpty()) {
                logger.warn("⚠️ Investigation ID is null or empty");
                return new java.util.ArrayList<>();
            }
            
            List<Evidence> evidenceList = evidenceRepository.findByInvestigationId(investigationId);
            logger.info("✅ Found {} evidence items for investigation {}", evidenceList.size(), investigationId);
            
            if (evidenceList.isEmpty()) {
                logger.warn("⚠️ No evidence found for investigation ID: {}", investigationId);
                return new java.util.ArrayList<>();
            } else {
                evidenceList.forEach(e -> logger.info("📦 Evidence: ID={}, Name={}, InvestigationId={}", 
                    e.getEvidenceId(), e.getEvidenceName(), e.getInvestigationId()));
            }
            
            List<EvidenceDTO> result = new java.util.ArrayList<>();
            for (Evidence evidence : evidenceList) {
                try {
                    EvidenceDTO dto = mapToDTO(evidence);
                    result.add(dto);
                } catch (Exception e) {
                    logger.error("❌ Error mapping evidence ID {}: {}", evidence.getEvidenceId(), e.getMessage(), e);
                    // Continue with next evidence instead of failing completely
                }
            }
            
            logger.info("✅ Successfully mapped {} evidence items", result.size());
            return result;
        } catch (Exception e) {
            logger.error("❌ Error in getEvidenceByInvestigationId: {}", e.getMessage(), e);
            return new java.util.ArrayList<>();
        }
    }

    @Override
    public List<EvidenceDTO> getEvidenceByInternalId(Integer investigationInternalId) {
        logger.info("🔍 ===== GET EVIDENCE BY INTERNAL ID =====");
        logger.info("🔍 Querying evidence for internal ID: {}", investigationInternalId);
        
        try {
            if (investigationInternalId == null) {
                logger.warn("⚠️ Internal ID is null");
                return new java.util.ArrayList<>();
            }
            
            List<Evidence> evidenceList = evidenceRepository.findByInvestigationInternalId(investigationInternalId);
            logger.info("✅ Found {} evidence items for internal ID {}", evidenceList.size(), investigationInternalId);
            
            if (evidenceList.isEmpty()) {
                logger.warn("⚠️ No evidence found for internal ID: {}", investigationInternalId);
                return new java.util.ArrayList<>();
            } else {
                evidenceList.forEach(e -> logger.info("📦 Evidence: ID={}, Name={}, InternalId={}", 
                    e.getEvidenceId(), e.getEvidenceName(), e.getInvestigationInternalId()));
            }
            
            List<EvidenceDTO> result = new java.util.ArrayList<>();
            for (Evidence evidence : evidenceList) {
                try {
                    EvidenceDTO dto = mapToDTO(evidence);
                    result.add(dto);
                } catch (Exception e) {
                    logger.error("❌ Error mapping evidence ID {}: {}", evidence.getEvidenceId(), e.getMessage(), e);
                }
            }
            
            logger.info("✅ Successfully mapped {} evidence items", result.size());
            return result;
        } catch (Exception e) {
            logger.error("❌ Error in getEvidenceByInternalId: {}", e.getMessage(), e);
            return new java.util.ArrayList<>();
        }
    }

    @Override
    public Page<EvidenceDTO> searchEvidence(String keyword, Pageable pageable) {
        return evidenceRepository
            .searchEvidence(keyword, pageable)
            .map(this::mapToDTO);
    }

    @Override
    public Page<EvidenceDTO> getAllEvidenceWithFilters(
        String investigationId,
        String evidenceType,
        Pageable pageable
    ) {
        return evidenceRepository
            .findAllWithFilters(investigationId, evidenceType, pageable)
            .map(this::mapToDTO);
    }

    @Override
    public Optional<EvidenceDTO> updateEvidence(
        Integer evidenceId,
        EvidenceRequestDTO requestDTO
    ) {
        return evidenceRepository
            .findById(evidenceId)
            .map(existing -> updateEntityFromRequest(existing, requestDTO))
            .map(evidenceRepository::save)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public boolean deleteEvidence(Integer evidenceId) {
        logger.info("🗑️ Deleting evidence with ID: {}", evidenceId);
        
        return evidenceRepository
            .findById(evidenceId)
            .map(evidence -> {
                try {
                    // First, delete associated EvidenceDocument records
                    List<EvidenceDocument> evidenceDocuments = evidenceDocumentRepository.findByEvidenceId(evidenceId);
                    if (!evidenceDocuments.isEmpty()) {
                        logger.info("🔗 Deleting {} associated EvidenceDocument records", evidenceDocuments.size());
                        evidenceDocumentRepository.deleteAll(evidenceDocuments);
                    }
                    
                    // Delete the file from filesystem if it exists
                    if (evidence.getFilePath() != null && !evidence.getFilePath().isEmpty()) {
                        try {
                            Path filePath = Paths.get(evidence.getFilePath());
                            if (Files.exists(filePath)) {
                                Files.delete(filePath);
                                logger.info("📁 Deleted file: {}", evidence.getFilePath());
                            }
                        } catch (IOException e) {
                            logger.warn("⚠️ Could not delete file {}: {}", evidence.getFilePath(), e.getMessage());
                            // Continue with database deletion even if file deletion fails
                        }
                    }
                    
                    // Finally, delete the evidence record
                    evidenceRepository.delete(evidence);
                    logger.info("✅ Evidence deleted successfully: {}", evidenceId);
                    return true;
                } catch (Exception e) {
                    logger.error("❌ Error deleting evidence {}: {}", evidenceId, e.getMessage(), e);
                    return false;
                }
            })
            .orElse(false);
    }

    @Override
    public long countByInvestigationId(String investigationId) {
        return evidenceRepository.countByInvestigationId(investigationId);
    }

    @Override
    public EvidenceDTO createEvidence(EvidenceRequestDTO requestDTO) {
        logger.info("📝 ===== CREATE EVIDENCE SERVICE =====");
        logger.info("📋 Request DTO investigationId: {}", requestDTO.getInvestigationId());
        logger.info("📋 Request DTO investigationInternalId: {}", requestDTO.getInvestigationInternalId());
        
        Evidence entity = mapRequestToEntity(requestDTO);
        logger.info("📦 Entity investigationInternalId before save: {}", entity.getInvestigationInternalId());
        
        Evidence savedEntity = evidenceRepository.save(entity);
        logger.info("✅ Entity investigationInternalId after save: {}", savedEntity.getInvestigationInternalId());
        
        return mapToDTO(savedEntity);
    }

    @Override
    public EvidenceDTO uploadEvidence(
        String investigationId,
        EvidenceRequestDTO requestDTO,
        MultipartFile file
    ) {
        logger.info("📦 ===== UPLOAD EVIDENCE SERVICE =====");
        logger.info("🔍 Investigation ID: {}", investigationId);
        logger.info("📁 File: {}", file.getOriginalFilename());

        // First upload the document
        DocumentRequestDTO documentRequest = DocumentRequestDTO.builder()
            .documentType("EVIDENCE")
            .uploadedBy(1) // TODO: Get from security context
            .investigationId(investigationId)
            .fileName(file.getOriginalFilename())
            .description("Evidence file for investigation " + investigationId)
            .build();

        logger.info("💾 Uploading document...");
        DocumentDTO document = uploadDocument(documentRequest, file);
        logger.info(
            "✅ Document uploaded with ID: {}",
            document.getDocumentId()
        );

        // Create evidence record - IMPORTANT: Include investigationInternalId for entry-specific evidence
        logger.info("📋 Creating evidence with investigationInternalId: {}", requestDTO.getInvestigationInternalId());
        EvidenceRequestDTO evidenceRequest = EvidenceRequestDTO.builder()
            .investigationId(investigationId)
            .investigationInternalId(requestDTO.getInvestigationInternalId()) // Link to specific investigation entry
            .evidenceName(
                requestDTO.getEvidenceName() != null
                    ? requestDTO.getEvidenceName()
                    : file.getOriginalFilename()
            )
            .description(
                requestDTO.getDescription() != null
                    ? requestDTO.getDescription()
                    : "Evidence file"
            )
            .evidenceType(
                requestDTO.getEvidenceType() != null
                    ? requestDTO.getEvidenceType()
                    : "DOCUMENT"
            )
            .locationFound(requestDTO.getLocationFound())
            .collectedBy(requestDTO.getCollectedBy())
            .collectedOn(requestDTO.getCollectedOn())
            .fileType(file.getContentType())
            .build();

        logger.info("📝 Creating evidence record...");
        EvidenceDTO evidence = createEvidence(evidenceRequest);
        logger.info(
            "✅ Evidence created with ID: {}",
            evidence.getEvidenceId()
        );

        // Update evidence with document file path
        Evidence existingEvidence = evidenceRepository
            .findById(evidence.getEvidenceId())
            .orElseThrow();
        Evidence updatedEvidence = existingEvidence
            .toBuilder()
            .filePath(document.getFilePath())
            .fileType(file.getContentType())
            .fileSize(file.getSize())
            .build();
        evidenceRepository.save(updatedEvidence);
        logger.info("✅ Evidence updated with file path");

        // Link document to evidence
        EvidenceDocumentRequestDTO linkRequest =
            EvidenceDocumentRequestDTO.builder()
                .evidenceId(evidence.getEvidenceId())
                .documentId(document.getDocumentId())
                .build();

        logger.info(
            "🔗 Linking document {} to evidence {}",
            document.getDocumentId(),
            evidence.getEvidenceId()
        );
        EvidenceDocumentDTO linkedDoc = linkDocumentToEvidence(linkRequest);
        logger.info(
            "✅ Document linked successfully! EvidenceDocument ID: {}",
            linkedDoc.getEvidenceDocumentId()
        );

        // Return updated evidence
        return mapToDTO(updatedEvidence);
    }

    @Override
    public EvidenceDocumentDTO linkDocumentToEvidence(
        EvidenceDocumentRequestDTO requestDTO
    ) {
        logger.info("🔗 ===== LINKING DOCUMENT TO EVIDENCE =====");
        logger.info("📝 Evidence ID: {}", requestDTO.getEvidenceId());
        logger.info("📄 Document ID: {}", requestDTO.getDocumentId());

        try {
            EvidenceDocument entity = mapDocumentRequestToEntity(requestDTO);
            logger.info("📦 EvidenceDocument entity created: {}", entity);

            EvidenceDocument saved = evidenceDocumentRepository.save(entity);
            logger.info(
                "✅ EvidenceDocument saved with ID: {}",
                saved.getEvidenceDocumentId()
            );

            EvidenceDocumentDTO dto = mapDocumentToDTO(saved);
            logger.info("✅ Returning EvidenceDocumentDTO: {}", dto);

            return dto;
        } catch (Exception e) {
            logger.error(
                "❌ Failed to link document to evidence: {}",
                e.getMessage(),
                e
            );
            throw new EvidenceDocumentSaveException(
                "Failed to link document to evidence: " + e.getMessage()
            );
        }
    }

    @Override
    public List<EvidenceDocumentDTO> getDocumentsByEvidenceId(
        Integer evidenceId
    ) {
        return evidenceDocumentRepository
            .findByEvidenceId(evidenceId)
            .stream()
            .map(this::mapDocumentToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public boolean unlinkDocumentFromEvidence(
        Integer evidenceId,
        Integer documentId
    ) {
        return evidenceDocumentRepository
            .findByEvidenceIdAndDocumentId(evidenceId, documentId)
            .stream()
            .findFirst()
            .map(evidenceDocument -> {
                evidenceDocumentRepository.delete(evidenceDocument);
                return true;
            })
            .orElse(false);
    }

    @Override
    public DocumentDTO uploadDocument(
        DocumentRequestDTO requestDTO,
        MultipartFile file
    ) {
        if (requestDTO == null) {
            throw new IllegalArgumentException(
                "Document request DTO cannot be null"
            );
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }
        if (requestDTO.getInvestigationId() == null) {
            throw new IllegalArgumentException("Investigation ID is required");
        }

        try {
            Integer uploadedBy = requestDTO.getUploadedBy() != null
                ? requestDTO.getUploadedBy()
                : 1;

            logger.info("📤 Calling DocumentServiceClient.uploadDocument with linkedTo=OFFICER_INVESTIGATION, linkId={}, tag={}", 
                requestDTO.getInvestigationId(), requestDTO.getDocumentType());
            
            // Call document service via Feign client (DocumentServiceClient)
            Map<String, Object> response = documentServiceClient.uploadDocument(
                file,
                "OFFICER_INVESTIGATION",
                requestDTO.getInvestigationId().toString(),
                requestDTO.getDocumentType(),
                uploadedBy.toString()
            );

            logger.info("📥 Document service response: {}", response);
            
            if (response == null) {
                throw new DocumentUploadException(
                    "Document service returned null response"
                );
            }

            Integer documentId = extractIntegerFromResponse(
                response,
                "documentId"
            );
            String fileName = (String) response.getOrDefault(
                "fileName",
                file.getOriginalFilename()
            );

            logger.info("✅ Extracted documentId: {}, fileName: {}", documentId, fileName);
            
            if (documentId == null) {
                throw new DocumentUploadException(
                    "Document ID not found in response. Response keys: " + response.keySet()
                );
            }

            // Document is already saved by Document Service, so we just create a DTO response
            // without trying to save it again locally (which causes Hibernate conflicts)
            String filePath = (String) response.getOrDefault("fileUrl", "");
            
            DocumentDTO documentDTO = DocumentDTO.builder()
                .documentId(documentId)
                .fileName(fileName)
                .filePath(filePath)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .documentType(requestDTO.getDocumentType())
                .uploadedBy(uploadedBy)
                .uploadedOn(LocalDateTime.now())
                .createdBy(uploadedBy)
                .createdOn(LocalDateTime.now())
                .build();
            
            logger.info("✅ Document DTO created: {}", documentDTO);

            // Link to evidence if evidenceId is provided
            if (requestDTO.getEvidenceId() != null) {
                linkDocumentToEvidence(
                    requestDTO.getEvidenceId(),
                    documentId,
                    uploadedBy
                );
            }

            return documentDTO;
        } catch (DocumentUploadException e) {
            throw e;
        } catch (Exception e) {
            throw new DocumentUploadException(
                "Failed to upload document: " + e.getMessage(),
                e
            );
        }
    }

    private Integer extractIntegerFromResponse(
        Map<String, Object> response,
        String key
    ) {
        Object value = response.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        } else if (value != null) {
            try {
                return Integer.parseInt(value.toString());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Document createDocumentEntity(
        Integer documentId,
        String fileName,
        MultipartFile file,
        DocumentRequestDTO requestDTO,
        Integer uploadedBy
    ) {
        Document document = new Document();
        document.setDocumentId(documentId);
        document.setFileName(fileName);
        document.setFilePath(""); // Not used when document is stored in document service
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setDocumentType(requestDTO.getDocumentType());
        document.setUploadedBy(uploadedBy);
        document.setUploadedOn(LocalDateTime.now());
        document.setCreatedBy(uploadedBy);
        document.setCreatedOn(LocalDateTime.now());
        return document;
    }

    private void linkDocumentToEvidence(
        Integer evidenceId,
        Integer documentId,
        Integer createdBy
    ) {
        EvidenceDocument evidenceDocument = new EvidenceDocument();
        evidenceDocument.setEvidenceId(evidenceId);
        evidenceDocument.setDocumentId(documentId);
        evidenceDocument.setCreatedBy(createdBy);
        evidenceDocument.setCreatedOn(LocalDateTime.now());
        evidenceDocumentRepository.save(evidenceDocument);
    }

    @Override
    public Optional<DocumentDTO> getDocumentById(Integer documentId) {
        return documentRepository
            .findById(documentId)
            .map(this::mapDocumentToDTO);
    }

    @Override
    public List<DocumentDTO> getDocumentsByType(String documentType) {
        return documentRepository
            .findByDocumentType(documentType)
            .stream()
            .map(this::mapDocumentToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<DocumentDTO> searchDocuments(
        String keyword,
        Pageable pageable
    ) {
        return documentRepository
            .searchDocuments(keyword, pageable)
            .map(this::mapDocumentToDTO);
    }

    @Override
    public boolean deleteDocument(Integer documentId) {
        return documentRepository
            .findById(documentId)
            .map(document -> {
                // Delete file from filesystem
                try {
                    Files.deleteIfExists(Paths.get(document.getFilePath()));
                } catch (IOException e) {
                    // Log error but continue with database deletion
                    System.err.println(
                        "Failed to delete file: " + e.getMessage()
                    );
                }
                documentRepository.delete(document);
                return true;
            })
            .orElse(false);
    }

    @Override
    public PanchnamaDTO createPanchnama(PanchnamaRequestDTO requestDTO) {
        return Optional.of(requestDTO)
            .map(this::mapPanchnamaRequestToEntity)
            .map(panchnamaRepository::save)
            .map(this::mapPanchnamaToDTO)
            .orElseThrow(() ->
                new PanchnamaSaveException("Failed to create panchnama")
            );
    }

    @Override
    public Optional<PanchnamaDTO> getPanchnamaById(Integer panchnamaId) {
        return panchnamaRepository
            .findById(panchnamaId)
            .map(this::mapPanchnamaToDTO);
    }

    @Override
    public List<PanchnamaDTO> getPanchnamasByEvidenceId(Integer evidenceId) {
        return panchnamaRepository
            .findByEvidenceId(evidenceId)
            .stream()
            .map(this::mapPanchnamaToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<PanchnamaDTO> searchPanchnamas(
        String keyword,
        Pageable pageable
    ) {
        return panchnamaRepository
            .searchPanchnamas(keyword, pageable)
            .map(this::mapPanchnamaToDTO);
    }

    @Override
    public Optional<PanchnamaDTO> updatePanchnama(
        Integer panchnamaId,
        PanchnamaRequestDTO requestDTO
    ) {
        return panchnamaRepository
            .findById(panchnamaId)
            .map(existing ->
                updatePanchnamaEntityFromRequest(existing, requestDTO)
            )
            .map(panchnamaRepository::save)
            .map(this::mapPanchnamaToDTO);
    }

    @Override
    public boolean deletePanchnama(Integer panchnamaId) {
        return panchnamaRepository
            .findById(panchnamaId)
            .map(panchnama -> {
                panchnamaRepository.delete(panchnama);
                return true;
            })
            .orElse(false);
    }

    @Override
    public ForensicReportDTO createForensicReport(
        ForensicReportRequestDTO requestDTO
    ) {
        return Optional.of(requestDTO)
            .map(this::mapForensicReportRequestToEntity)
            .map(forensicReportRepository::save)
            .map(this::mapForensicReportToDTO)
            .orElseThrow(() ->
                new ForensicReportSaveException(
                    "Failed to create forensic report"
                )
            );
    }

    @Override
    public Optional<ForensicReportDTO> getForensicReportById(
        Integer forensicReportId
    ) {
        return forensicReportRepository
            .findById(forensicReportId)
            .map(this::mapForensicReportToDTO);
    }

    @Override
    public List<ForensicReportDTO> getForensicReportsByEvidenceId(
        Integer evidenceId
    ) {
        return forensicReportRepository
            .findByEvidenceId(evidenceId)
            .stream()
            .map(this::mapForensicReportToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ForensicReportDTO> getForensicReportsByLabName(String labName) {
        return forensicReportRepository
            .findByLabName(labName)
            .stream()
            .map(this::mapForensicReportToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<ForensicReportDTO> searchForensicReports(
        String keyword,
        Pageable pageable
    ) {
        return forensicReportRepository
            .searchForensicReports(keyword, pageable)
            .map(this::mapForensicReportToDTO);
    }

    @Override
    public Optional<ForensicReportDTO> updateForensicReport(
        Integer forensicReportId,
        ForensicReportRequestDTO requestDTO
    ) {
        return forensicReportRepository
            .findById(forensicReportId)
            .map(existing ->
                updateForensicReportEntityFromRequest(existing, requestDTO)
            )
            .map(forensicReportRepository::save)
            .map(this::mapForensicReportToDTO);
    }

    @Override
    public boolean deleteForensicReport(Integer forensicReportId) {
        return forensicReportRepository
            .findById(forensicReportId)
            .map(forensicReport -> {
                forensicReportRepository.delete(forensicReport);
                return true;
            })
            .orElse(false);
    }

    private Evidence mapRequestToEntity(EvidenceRequestDTO requestDTO) {
        return Evidence.builder()
            .investigationId(requestDTO.getInvestigationId())
            .investigationInternalId(requestDTO.getInvestigationInternalId())
            .evidenceName(requestDTO.getEvidenceName())
            .description(requestDTO.getDescription())
            .evidenceType(requestDTO.getEvidenceType())
            .locationFound(requestDTO.getLocationFound())
            .collectedBy(requestDTO.getCollectedBy())
            .collectedOn(requestDTO.getCollectedOn())
            .fileType(requestDTO.getFileType())
            .createdBy(1) // TODO: Get from security context
            .createdOn(LocalDateTime.now())
            .build();
    }

    private Evidence updateEntityFromRequest(
        Evidence existing,
        EvidenceRequestDTO requestDTO
    ) {
        return existing
            .toBuilder()
            .evidenceName(
                requestDTO.getEvidenceName() != null
                    ? requestDTO.getEvidenceName()
                    : existing.getEvidenceName()
            )
            .description(
                requestDTO.getDescription() != null
                    ? requestDTO.getDescription()
                    : existing.getDescription()
            )
            .evidenceType(
                requestDTO.getEvidenceType() != null
                    ? requestDTO.getEvidenceType()
                    : existing.getEvidenceType()
            )
            .locationFound(
                requestDTO.getLocationFound() != null
                    ? requestDTO.getLocationFound()
                    : existing.getLocationFound()
            )
            .collectedBy(
                requestDTO.getCollectedBy() != null
                    ? requestDTO.getCollectedBy()
                    : existing.getCollectedBy()
            )
            .collectedOn(
                requestDTO.getCollectedOn() != null
                    ? requestDTO.getCollectedOn()
                    : existing.getCollectedOn()
            )
            .fileType(
                requestDTO.getFileType() != null
                    ? requestDTO.getFileType()
                    : existing.getFileType()
            )
            .updatedBy(1) // TODO: Get from security context
            .updatedOn(LocalDateTime.now())
            .build();
    }

    private EvidenceDTO mapToDTO(Evidence evidence) {
        try {
            // Fetch documentId from EvidenceDocument table
            Integer documentId = null;
            String filePath = evidence.getFilePath();
            
            try {
                List<EvidenceDocument> evidenceDocuments = evidenceDocumentRepository.findByEvidenceId(evidence.getEvidenceId());
                if (!evidenceDocuments.isEmpty()) {
                    documentId = evidenceDocuments.get(0).getDocumentId();
                    
                    // If filePath is empty but documentId exists, fetch from local Document repository
                    if ((filePath == null || filePath.isEmpty()) && documentId != null) {
                        try {
                            logger.info("📄 Fetching document details for documentId: {}", documentId);
                            Optional<Document> documentOpt = documentRepository.findById(documentId);
                            if (documentOpt.isPresent()) {
                                Document document = documentOpt.get();
                                filePath = document.getFilePath();
                                logger.info("✅ Document filePath fetched: {}", filePath);
                            } else {
                                logger.warn("⚠️ Document not found in repository for documentId: {}", documentId);
                            }
                        } catch (Exception e) {
                            logger.warn("⚠️ Error fetching document details: {}", e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("⚠️ Error fetching evidence documents: {}", e.getMessage(), e);
            }
            
            logger.info("📋 Mapping evidence to DTO - evidenceId: {}, filePath: {}, documentId: {}", 
                evidence.getEvidenceId(), filePath, documentId);
            
            return EvidenceDTO.builder()
                .evidenceId(evidence.getEvidenceId())
                .investigationId(evidence.getInvestigationId())
                .investigationInternalId(evidence.getInvestigationInternalId())
                .evidenceName(evidence.getEvidenceName())
                .description(evidence.getDescription())
                .evidenceType(evidence.getEvidenceType())
                .locationFound(evidence.getLocationFound())
                .collectedBy(evidence.getCollectedBy())
                .collectedOn(evidence.getCollectedOn())
                .fileType(evidence.getFileType())
                .filePath(filePath)
                .fileSize(evidence.getFileSize())
                .documentId(documentId)
                .createdBy(evidence.getCreatedBy())
                .createdOn(evidence.getCreatedOn())
                .updatedBy(evidence.getUpdatedBy())
                .updatedOn(evidence.getUpdatedOn())
                .build();
        } catch (Exception e) {
            logger.error("❌ Error mapping evidence to DTO: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to map evidence to DTO: " + e.getMessage(), e);
        }
    }

    private EvidenceDocument mapDocumentRequestToEntity(
        EvidenceDocumentRequestDTO requestDTO
    ) {
        return EvidenceDocument.builder()
            .evidenceId(requestDTO.getEvidenceId())
            .documentId(requestDTO.getDocumentId())
            .createdBy(1) // TODO: Get from security context
            .createdOn(LocalDateTime.now())
            .build();
    }

    private EvidenceDocumentDTO mapDocumentToDTO(
        EvidenceDocument evidenceDocument
    ) {
        return EvidenceDocumentDTO.builder()
            .evidenceDocumentId(evidenceDocument.getEvidenceDocumentId())
            .evidenceId(evidenceDocument.getEvidenceId())
            .documentId(evidenceDocument.getDocumentId())
            .createdBy(evidenceDocument.getCreatedBy())
            .createdOn(evidenceDocument.getCreatedOn())
            .build();
    }

    private DocumentDTO mapDocumentToDTO(Document document) {
        return DocumentDTO.builder()
            .documentId(document.getDocumentId())
            .fileName(document.getFileName())
            .filePath(document.getFilePath())
            .fileType(document.getFileType())
            .fileSize(document.getFileSize())
            .documentType(document.getDocumentType())
            .uploadedBy(document.getUploadedBy())
            .uploadedOn(document.getUploadedOn())
            .createdBy(document.getCreatedBy())
            .createdOn(document.getCreatedOn())
            .updatedBy(document.getUpdatedBy())
            .updatedOn(document.getUpdatedOn())
            .build();
    }

    private Panchnama mapPanchnamaRequestToEntity(
        PanchnamaRequestDTO requestDTO
    ) {
        return Panchnama.builder()
            .evidenceId(requestDTO.getEvidenceId())
            .panchnamaDate(
                requestDTO.getPanchnamaDate() != null
                    ? requestDTO.getPanchnamaDate()
                    : LocalDateTime.now()
            )
            .panchnamaText(requestDTO.getPanchnamaText())
            .witness1Name(requestDTO.getWitness1Name())
            .witness1Address(requestDTO.getWitness1Address())
            .witness2Name(requestDTO.getWitness2Name())
            .witness2Address(requestDTO.getWitness2Address())
            .officerSignature(requestDTO.getOfficerSignature())
            .createdBy(1) // TODO: Get from security context
            .createdOn(LocalDateTime.now())
            .build();
    }

    private Panchnama updatePanchnamaEntityFromRequest(
        Panchnama existing,
        PanchnamaRequestDTO requestDTO
    ) {
        return existing
            .toBuilder()
            .panchnamaText(
                requestDTO.getPanchnamaText() != null
                    ? requestDTO.getPanchnamaText()
                    : existing.getPanchnamaText()
            )
            .witness1Name(
                requestDTO.getWitness1Name() != null
                    ? requestDTO.getWitness1Name()
                    : existing.getWitness1Name()
            )
            .witness1Address(
                requestDTO.getWitness1Address() != null
                    ? requestDTO.getWitness1Address()
                    : existing.getWitness1Address()
            )
            .witness2Name(
                requestDTO.getWitness2Name() != null
                    ? requestDTO.getWitness2Name()
                    : existing.getWitness2Name()
            )
            .witness2Address(
                requestDTO.getWitness2Address() != null
                    ? requestDTO.getWitness2Address()
                    : existing.getWitness2Address()
            )
            .officerSignature(
                requestDTO.getOfficerSignature() != null
                    ? requestDTO.getOfficerSignature()
                    : existing.getOfficerSignature()
            )
            .updatedBy(1) // TODO: Get from security context
            .updatedOn(LocalDateTime.now())
            .build();
    }

    private PanchnamaDTO mapPanchnamaToDTO(Panchnama panchnama) {
        return PanchnamaDTO.builder()
            .panchnamaId(panchnama.getPanchnamaId())
            .evidenceId(panchnama.getEvidenceId())
            .panchnamaDate(panchnama.getPanchnamaDate())
            .panchnamaText(panchnama.getPanchnamaText())
            .witness1Name(panchnama.getWitness1Name())
            .witness1Address(panchnama.getWitness1Address())
            .witness2Name(panchnama.getWitness2Name())
            .witness2Address(panchnama.getWitness2Address())
            .officerSignature(panchnama.getOfficerSignature())
            .createdBy(panchnama.getCreatedBy())
            .createdOn(panchnama.getCreatedOn())
            .updatedBy(panchnama.getUpdatedBy())
            .updatedOn(panchnama.getUpdatedOn())
            .build();
    }

    private ForensicReport mapForensicReportRequestToEntity(
        ForensicReportRequestDTO requestDTO
    ) {
        return ForensicReport.builder()
            .evidenceId(requestDTO.getEvidenceId())
            .reportDate(
                requestDTO.getReportDate() != null
                    ? requestDTO.getReportDate()
                    : LocalDateTime.now()
            )
            .reportText(requestDTO.getReportText())
            .labName(requestDTO.getLabName())
            .expertName(requestDTO.getExpertName())
            .reportNumber(requestDTO.getReportNumber())
            .findings(requestDTO.getFindings())
            .conclusion(requestDTO.getConclusion())
            .createdBy(1) // TODO: Get from security context
            .createdOn(LocalDateTime.now())
            .build();
    }

    private ForensicReport updateForensicReportEntityFromRequest(
        ForensicReport existing,
        ForensicReportRequestDTO requestDTO
    ) {
        return existing
            .toBuilder()
            .reportText(
                requestDTO.getReportText() != null
                    ? requestDTO.getReportText()
                    : existing.getReportText()
            )
            .labName(
                requestDTO.getLabName() != null
                    ? requestDTO.getLabName()
                    : existing.getLabName()
            )
            .expertName(
                requestDTO.getExpertName() != null
                    ? requestDTO.getExpertName()
                    : existing.getExpertName()
            )
            .reportNumber(
                requestDTO.getReportNumber() != null
                    ? requestDTO.getReportNumber()
                    : existing.getReportNumber()
            )
            .findings(
                requestDTO.getFindings() != null
                    ? requestDTO.getFindings()
                    : existing.getFindings()
            )
            .conclusion(
                requestDTO.getConclusion() != null
                    ? requestDTO.getConclusion()
                    : existing.getConclusion()
            )
            .updatedBy(1) // TODO: Get from security context
            .updatedOn(LocalDateTime.now())
            .build();
    }

    private ForensicReportDTO mapForensicReportToDTO(
        ForensicReport forensicReport
    ) {
        return ForensicReportDTO.builder()
            .forensicReportId(forensicReport.getForensicReportId())
            .evidenceId(forensicReport.getEvidenceId())
            .reportDate(forensicReport.getReportDate())
            .reportText(forensicReport.getReportText())
            .labName(forensicReport.getLabName())
            .expertName(forensicReport.getExpertName())
            .reportNumber(forensicReport.getReportNumber())
            .findings(forensicReport.getFindings())
            .conclusion(forensicReport.getConclusion())
            .createdBy(forensicReport.getCreatedBy())
            .createdOn(forensicReport.getCreatedOn())
            .updatedBy(forensicReport.getUpdatedBy())
            .updatedOn(forensicReport.getUpdatedOn())
            .build();
    }

    @Override
    public WitnessDTO createWitness(WitnessRequestDTO requestDTO) {
        return Optional.of(requestDTO)
            .map(this::mapWitnessRequestToEntity)
            .map(witnessRepository::save)
            .map(this::mapWitnessToDTO)
            .orElseThrow(() ->
                new RuntimeException("Failed to create witness")
            );
    }

    @Override
    public Optional<WitnessDTO> getWitnessById(Integer witnessId) {
        return witnessRepository.findById(witnessId).map(this::mapWitnessToDTO);
    }

    @Override
    public List<WitnessDTO> getWitnessesByInvestigationId(
        Integer investigationId
    ) {
        return witnessRepository
            .findByInvestigationId(investigationId)
            .stream()
            .map(this::mapWitnessToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<WitnessDTO> searchWitnesses(String keyword, Pageable pageable) {
        return witnessRepository
            .searchWitnesses(keyword, pageable)
            .map(this::mapWitnessToDTO);
    }

    @Override
    public boolean deleteWitness(Integer witnessId) {
        return witnessRepository
            .findById(witnessId)
            .map(witness -> {
                witnessRepository.delete(witness);
                return true;
            })
            .orElse(false);
    }

    @Override
    public List<WitnessDTO> createWitnessesForVictim(
        Integer victimId,
        String witnessDtosJson,
        List<MultipartFile> files
    ) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> witnessDataList = objectMapper.readValue(
                witnessDtosJson,
                new TypeReference<List<Map<String, Object>>>() {}
            );

            List<WitnessDTO> createdWitnesses = new ArrayList<>();

            for (int i = 0; i < witnessDataList.size(); i++) {
                Map<String, Object> witnessData = witnessDataList.get(i);

                // Handle file uploads for this witness
                if (files != null && i < files.size()) {
                    MultipartFile file = files.get(i);
                    if (file != null && !file.isEmpty()) {
                        DocumentDTO document = uploadDocument(
                            DocumentRequestDTO.builder()
                                .documentType("WITNESS")
                                .uploadedBy(1) // TODO: Get from security context
                                .investigationId(
                                    String.valueOf(witnessData.get("investigationId"))
                                )
                                .fileName(file.getOriginalFilename())
                                .description(
                                    "Witness document for " +
                                        witnessData.get("witnessName")
                                )
                                .build(),
                            file
                        );

                        // Set file paths based on document type
                        String fileName = file
                            .getOriginalFilename()
                            .toLowerCase();
                        if (fileName.contains("aadhar")) {
                            witnessData.put(
                                "aadharFilePath",
                                document.getFilePath()
                            );
                        } else if (fileName.contains("pan")) {
                            witnessData.put(
                                "panFilePath",
                                document.getFilePath()
                            );
                        } else {
                            witnessData.put(
                                "passportFilePath",
                                document.getFilePath()
                            );
                        }
                    }
                }

                // Create WitnessRequestDTO from the map data
                WitnessRequestDTO witnessRequest = WitnessRequestDTO.builder()
                    .investigationId(
                        (Integer) witnessData.get("investigationId")
                    )
                    .witnessName((String) witnessData.get("witnessName"))
                    .witnessEmail((String) witnessData.get("witnessEmail"))
                    .witnessProfession(
                        (String) witnessData.get("witnessProfession")
                    )
                    .witnessGender((String) witnessData.get("witnessGender"))
                    .witnessAddress((String) witnessData.get("witnessAddress"))
                    .witnessAge(
                        witnessData.get("witnessAge") != null
                            ? Integer.parseInt(
                                  witnessData.get("witnessAge").toString()
                              )
                            : null
                    )
                    .witnessAadharNo(
                        (String) witnessData.get("witnessAadharNo")
                    )
                    .witnessMobileNo(
                        (String) witnessData.get("witnessMobileNo")
                    )
                    .witnessStatement(
                        (String) witnessData.get("witnessStatement")
                    )
                    .witnessType((String) witnessData.get("witnessType"))
                    .aadharFilePath((String) witnessData.get("aadharFilePath"))
                    .panFilePath((String) witnessData.get("panFilePath"))
                    .passportFilePath(
                        (String) witnessData.get("passportFilePath")
                    )
                    .createdBy(1) // TODO: Get from security context
                    .build();

                // Create the witness
                WitnessDTO createdWitness = createWitness(witnessRequest);
                createdWitnesses.add(createdWitness);
            }

            return createdWitnesses;
        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to create witnesses for victim: " + e.getMessage()
            );
        }
    }

    private Witness mapWitnessRequestToEntity(WitnessRequestDTO requestDTO) {
        return Witness.builder()
            .investigationId(requestDTO.getInvestigationId())
            .witnessName(requestDTO.getWitnessName())
            .witnessEmail(requestDTO.getWitnessEmail())
            .witnessProfession(requestDTO.getWitnessProfession())
            .witnessGender(requestDTO.getWitnessGender())
            .witnessAddress(requestDTO.getWitnessAddress())
            .witnessAge(requestDTO.getWitnessAge())
            .witnessAadharNo(requestDTO.getWitnessAadharNo())
            .witnessMobileNo(requestDTO.getWitnessMobileNo())
            .witnessStatement(requestDTO.getWitnessStatement())
            .witnessType(requestDTO.getWitnessType())
            .aadharFilePath(requestDTO.getAadharFilePath())
            .panFilePath(requestDTO.getPanFilePath())
            .passportFilePath(requestDTO.getPassportFilePath())
            .createdBy(
                requestDTO.getCreatedBy() != null
                    ? requestDTO.getCreatedBy()
                    : 1
            )
            .createdOn(LocalDateTime.now())
            .build();
    }

    private WitnessDTO mapWitnessToDTO(Witness witness) {
        return WitnessDTO.builder()
            .witnessId(witness.getWitnessId())
            .investigationId(witness.getInvestigationId())
            .witnessName(witness.getWitnessName())
            .witnessEmail(witness.getWitnessEmail())
            .witnessProfession(witness.getWitnessProfession())
            .witnessGender(witness.getWitnessGender())
            .witnessAddress(witness.getWitnessAddress())
            .witnessAge(witness.getWitnessAge())
            .witnessAadharNo(witness.getWitnessAadharNo())
            .witnessMobileNo(witness.getWitnessMobileNo())
            .witnessStatement(witness.getWitnessStatement())
            .witnessType(witness.getWitnessType())
            .aadharFilePath(witness.getAadharFilePath())
            .panFilePath(witness.getPanFilePath())
            .passportFilePath(witness.getPassportFilePath())
            .createdBy(witness.getCreatedBy())
            .createdOn(witness.getCreatedOn())
            .updatedBy(witness.getUpdatedBy())
            .updatedOn(witness.getUpdatedOn())
            .build();
    }

    private Witness updateWitnessEntityFromRequest(
        Witness existing,
        WitnessRequestDTO requestDTO
    ) {
        return existing
            .toBuilder()
            .witnessName(
                requestDTO.getWitnessName() != null
                    ? requestDTO.getWitnessName()
                    : existing.getWitnessName()
            )
            .witnessEmail(
                requestDTO.getWitnessEmail() != null
                    ? requestDTO.getWitnessEmail()
                    : existing.getWitnessEmail()
            )
            .witnessProfession(
                requestDTO.getWitnessProfession() != null
                    ? requestDTO.getWitnessProfession()
                    : existing.getWitnessProfession()
            )
            .witnessGender(
                requestDTO.getWitnessGender() != null
                    ? requestDTO.getWitnessGender()
                    : existing.getWitnessGender()
            )
            .witnessAddress(
                requestDTO.getWitnessAddress() != null
                    ? requestDTO.getWitnessAddress()
                    : existing.getWitnessAddress()
            )
            .witnessAge(
                requestDTO.getWitnessAge() != null
                    ? requestDTO.getWitnessAge()
                    : existing.getWitnessAge()
            )
            .witnessAadharNo(
                requestDTO.getWitnessAadharNo() != null
                    ? requestDTO.getWitnessAadharNo()
                    : existing.getWitnessAadharNo()
            )
            .witnessMobileNo(
                requestDTO.getWitnessMobileNo() != null
                    ? requestDTO.getWitnessMobileNo()
                    : existing.getWitnessMobileNo()
            )
            .witnessType(
                requestDTO.getWitnessType() != null
                    ? requestDTO.getWitnessType()
                    : existing.getWitnessType()
            )
            .aadharFilePath(
                requestDTO.getAadharFilePath() != null
                    ? requestDTO.getAadharFilePath()
                    : existing.getAadharFilePath()
            )
            .panFilePath(
                requestDTO.getPanFilePath() != null
                    ? requestDTO.getPanFilePath()
                    : existing.getPanFilePath()
            )
            .passportFilePath(
                requestDTO.getPassportFilePath() != null
                    ? requestDTO.getPassportFilePath()
                    : existing.getPassportFilePath()
            )
            .updatedBy(1)
            .updatedOn(LocalDateTime.now())
            .build();
    }

    @Override
    public Optional<WitnessDTO> updateWitness(
        Integer witnessId,
        WitnessRequestDTO requestDTO
    ) {
        // TODO: Implement witness update
        throw new UnsupportedOperationException(
            "Witness update not implemented"
        );
    }
}

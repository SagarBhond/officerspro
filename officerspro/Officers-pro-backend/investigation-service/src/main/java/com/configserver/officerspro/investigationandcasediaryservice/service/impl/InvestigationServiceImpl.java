package com.configserver.officerspro.investigationandcasediaryservice.service.impl;

import com.configserver.officerspro.investigationandcasediaryservice.audit.ActionType;
import com.configserver.officerspro.investigationandcasediaryservice.audit.AuditTrailRequestDTO;
import com.configserver.officerspro.investigationandcasediaryservice.client.*;
import com.configserver.officerspro.investigationandcasediaryservice.dto.*;
import com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet.*;
import com.configserver.officerspro.investigationandcasediaryservice.entity.CaseDiary;
import com.configserver.officerspro.investigationandcasediaryservice.entity.Evidence;
import com.configserver.officerspro.investigationandcasediaryservice.entity.EvidenceDocument;
import com.configserver.officerspro.investigationandcasediaryservice.entity.Investigation;
import com.configserver.officerspro.investigationandcasediaryservice.enums.InvestigationStatus;
import com.configserver.officerspro.investigationandcasediaryservice.repository.CaseDiaryRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.EvidenceDocumentRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.EvidenceRepository;
import com.configserver.officerspro.investigationandcasediaryservice.repository.InvestigationRepository;
import com.configserver.officerspro.investigationandcasediaryservice.service.InvestigationService;
import com.configserver.officerspro.investigationandcasediaryservice.util.CodeGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class InvestigationServiceImpl implements InvestigationService {

    private final EvidenceDocumentRepository evidenceDocumentRepository;

    private final FerristClient ferristClient;



private final InvestigationRepository investigationRepository;
    private final CaseDiaryRepository caseDiaryRepository;
    private final EvidenceRepository evidenceRepository;
    private final AuditClient auditClient;
    private final ObjectMapper objectMapper;
    private final CodeGenerator codeGenerator;
    private final ComplaintFirClient complaintFirClient;
    private final ProfileServiceClient profileServiceClient;
    private final DocumentServiceClient documentClient;

    @Autowired
    public InvestigationServiceImpl(EvidenceDocumentRepository evidenceDocumentRepository, FerristClient ferristClient, DocumentServiceClient documentClient, InvestigationRepository investigationRepository,
                                    CaseDiaryRepository caseDiaryRepository,
                                    EvidenceRepository evidenceRepository,
                                    AuditClient auditClient,
                                    ObjectMapper objectMapper,
                                    CodeGenerator codeGenerator,
                                    ComplaintFirClient complaintFirClient,
                                    ProfileServiceClient profileServiceClient) {
        this.evidenceDocumentRepository = evidenceDocumentRepository;
        this.ferristClient = ferristClient;
        this.documentClient = documentClient;
        this.investigationRepository = investigationRepository;
        this.caseDiaryRepository = caseDiaryRepository;
        this.evidenceRepository = evidenceRepository;
        this.auditClient = auditClient;
        this.objectMapper = objectMapper;
        this.codeGenerator = codeGenerator;
        this.complaintFirClient = complaintFirClient;
        this.profileServiceClient = profileServiceClient;
    }

    @Override
    @Transactional
    public InvestigationDTO createInvestigation(InvestigationRequestDTO requestDTO) {
        log.info("🔍 Creating investigation with FIR ID: {}", requestDTO.getFirId());
        log.info("📋 Request Details - OfficerId: {}, Status: {}, Description: {}", 
            requestDTO.getOfficerId(), requestDTO.getStatus(), requestDTO.getDescription());
        
        // Check if investigation already exists for this FIR ID to get the investigation ID
        List<Investigation> existingInvestigations = investigationRepository.findByFirId(requestDTO.getFirId());
        
        String investigationCode;
        Integer recordId;
        
        if (!existingInvestigations.isEmpty()) {
            // Use the same investigation ID as existing investigations for this FIR
            investigationCode = existingInvestigations.get(0).getInvestigationId();
            log.info("⚠️ Using existing investigation ID for FIR ID: {}. Investigation Code: {}", requestDTO.getFirId(), investigationCode);
        } else {
            // Get next investigation sequence number from database for new FIR
            Integer nextSequence = investigationRepository.getNextInvestigationSequence();
            log.info("📊 Next investigation sequence: {}", nextSequence);
            
            // Generate investigation code BEFORE saving
            investigationCode = codeGenerator.generateInvestigationCode(nextSequence);
            log.info("📝 Generated investigation code: {}", investigationCode);
        }
        
        recordId = (int) (investigationRepository.count() + 1); // Use count as record ID for audit
        
        // Create new investigation WITH investigationId (can be same as existing for same FIR)
        Investigation investigation = Investigation.builder()
                .investigationId(investigationCode)
                .firId(requestDTO.getFirId())
                .officerId(requestDTO.getOfficerId() != null ? requestDTO.getOfficerId() : 1)
                .assignedOn(requestDTO.getAssignedOn() != null ? requestDTO.getAssignedOn() : LocalDateTime.now())
                .status(requestDTO.getStatus() != null ? requestDTO.getStatus() : InvestigationStatus.IN_PROGRESS)
                .description(requestDTO.getDescription())
                .createdBy(1) // TODO: Get from security context
                .createdOn(LocalDateTime.now())
                .build();
        
        log.info("✅ Created new Investigation with ID: {}", investigationCode);
        
        log.info("💾 Saving investigation to database...");
        Investigation saved = investigationRepository.save(investigation);
        investigationRepository.flush(); // Force immediate write to database
        log.info("✅ Investigation saved with ID: {}, FIR ID: {}", saved.getInvestigationId(), saved.getFirId());
        
        // Auto-create CaseDiary entry for this investigation
        try {
            log.info("📝 Auto-creating CaseDiary entry for investigation: {}", saved.getInvestigationId());
            CaseDiary caseDiary = CaseDiary.builder()
                    .investigationId(saved.getInvestigationId())
                    .entryDate(LocalDateTime.now())
                    .entryText(saved.getDescription() != null ? saved.getDescription() : "Investigation started")
                    .createdBy(saved.getCreatedBy())
                    .createdOn(LocalDateTime.now())
                    .build();
            CaseDiary savedCaseDiary = caseDiaryRepository.save(caseDiary);
            log.info("✅ CaseDiary entry created with ID: {} for investigation: {}", savedCaseDiary.getDiaryId(), saved.getInvestigationId());
        } catch (Exception caseDiaryException) {
            log.error("⚠️ Failed to create CaseDiary entry: {}", caseDiaryException.getMessage());
            // Don't fail the investigation creation if CaseDiary creation fails
        }
        
        try {
            // Log audit entry
            Map<String, Object> afterState = new HashMap<>();
            afterState.put("investigationId", saved.getInvestigationId());
            afterState.put("firId", saved.getFirId());
            afterState.put("officerId", saved.getOfficerId());
            afterState.put("status", saved.getStatus());
            afterState.put("assignedOn", saved.getAssignedOn());
            afterState.put("description", saved.getDescription());
            
            String afterStateJson = objectMapper.writeValueAsString(afterState);
            
            AuditTrailRequestDTO auditRequest = AuditTrailRequestDTO.builder()
                    .tableName("investigation")
                    .recordId(recordId.longValue())
                    .action(ActionType.CREATED)
                    .changedBy(1L) // TODO: Get from security context
                    .beforeState(null)
                    .afterState(afterStateJson)
                    .remarks("Created new investigation for FIR ID: " + saved.getFirId())
                    .build();
            
            auditClient.createAuditTrail(auditRequest);
            log.debug("Audit logged for investigation creation: {}", saved.getInvestigationId());
            
        } catch (Exception e) {
            log.error("Failed to log audit for investigation: {}", e.getMessage(), e);
            // Don't fail the operation if audit logging fails
        }
        
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public Optional<String> updateInvestigationFrontend(InvestigationUpdateDTO updateDTO) {
        log.info("🔍 Updating investigation frontend with FIR ID: {}", updateDTO.getFirId());
        
        try {
            // Get the existing investigation by firId (victimId)
            List<Investigation> investigations = investigationRepository.findByFirId(updateDTO.getFirId());
            if (investigations.isEmpty()) {
                log.warn("Investigation not found with FIR ID: {}", updateDTO.getFirId());
                return Optional.of("Investigation not found with FIR ID: " + updateDTO.getFirId());
            }
            
            Investigation existingInvestigation = investigations.get(0);
            
            // Log the before state
            Map<String, Object> beforeState = new HashMap<>();
            beforeState.put("investigationId", existingInvestigation.getInvestigationId());
            beforeState.put("firId", existingInvestigation.getFirId());
            beforeState.put("officerId", existingInvestigation.getOfficerId());
            beforeState.put("status", existingInvestigation.getStatus());
            beforeState.put("assignedOn", existingInvestigation.getAssignedOn());
            beforeState.put("description", existingInvestigation.getDescription());
            
            String beforeStateJson = objectMapper.writeValueAsString(beforeState);
            
            // Update the investigation
            if (updateDTO.getInvestigationDetails() != null && updateDTO.getInvestigationDetails().getInvestDescription() != null) {
                existingInvestigation.setDescription(updateDTO.getInvestigationDetails().getInvestDescription());
            }
            if (updateDTO.getCaseStatus() != null) {
                existingInvestigation.setStatus(InvestigationStatus.valueOf(updateDTO.getCaseStatus()));
            }
            existingInvestigation.setUpdatedBy(1); // TODO: Get from security context
            existingInvestigation.setUpdatedOn(LocalDateTime.now());
            
            Investigation updatedInvestigation = investigationRepository.save(existingInvestigation);
            log.info("✅ Updated investigation with ID: {}", updatedInvestigation.getInvestigationId());
            
            // Log the after state
            Map<String, Object> afterState = new HashMap<>();
            afterState.put("investigationId", updatedInvestigation.getInvestigationId());
            afterState.put("firId", updatedInvestigation.getFirId());
            afterState.put("officerId", updatedInvestigation.getOfficerId());
            afterState.put("status", updatedInvestigation.getStatus());
            afterState.put("assignedOn", updatedInvestigation.getAssignedOn());
            afterState.put("description", updatedInvestigation.getDescription());
            
            String afterStateJson = objectMapper.writeValueAsString(afterState);
            
            // Log audit entry
            AuditTrailRequestDTO auditRequest = AuditTrailRequestDTO.builder()
                    .tableName("investigation")
                    .recordId((long) updatedInvestigation.getInvestigationId().hashCode())
                    .action(ActionType.UPDATED)
                    .changedBy(1L) // TODO: Get from security context
                    .beforeState(beforeStateJson)
                    .afterState(afterStateJson)
                    .remarks("Updated investigation details for FIR ID: " + updateDTO.getFirId())
                    .build();
            
            try {
                auditClient.createAuditTrail(auditRequest);
                log.debug("Audit logged for investigation update: {}", updatedInvestigation.getInvestigationId());
            } catch (Exception auditException) {
                log.error("Failed to log audit trail: {}", auditException.getMessage());
                // Don't fail the operation if audit logging fails
            }
            
            return Optional.empty(); // Empty means success - no error message

        } catch (Exception e) {
            log.error("❌ Exception in updateInvestigationFrontend: {}", e.getMessage(), e);
            return Optional.of("Failed to update investigation: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void updateInvestigationById(InvestigationByIdUpdateDTO updateDTO) {
        log.info("🔍 Updating investigation - internalId: {}, investigationId: {}", 
                updateDTO.getInternalId(), updateDTO.getInvestigationId());
        
        Investigation investigation;
        
        // PREFER internalId (unique primary key) over investigationId (can have duplicates)
        if (updateDTO.getInternalId() != null) {
            log.info("✅ Using internalId for update: {}", updateDTO.getInternalId());
            investigation = investigationRepository.findById(updateDTO.getInternalId())
                    .orElseThrow(() -> new RuntimeException("Investigation not found with internal ID: " + updateDTO.getInternalId()));
        } else if (updateDTO.getInvestigationId() != null) {
            log.warn("⚠️ Using investigationId (may have duplicates): {}", updateDTO.getInvestigationId());
            // Find investigation by investigationId (String format like INV/MH/PNE/2025/000001)
            investigation = investigationRepository.findByInvestigationId(updateDTO.getInvestigationId())
                    .orElseThrow(() -> new RuntimeException("Investigation not found with ID: " + updateDTO.getInvestigationId()));
        } else {
            throw new RuntimeException("Either internalId or investigationId must be provided");
        }
        
        // Update description
        if (updateDTO.getDescription() != null && !updateDTO.getDescription().trim().isEmpty()) {
            investigation.setDescription(updateDTO.getDescription());
            
            // IMPORTANT: Also update the corresponding case diary entry
            log.info("📝 Updating case diary entry for investigation: {}", updateDTO.getInvestigationId());
            List<CaseDiary> caseDiaries = caseDiaryRepository.findByInvestigationId(updateDTO.getInvestigationId());
            
            if (!caseDiaries.isEmpty()) {
                // Update the most recent case diary entry (or all of them)
                for (CaseDiary caseDiary : caseDiaries) {
                    caseDiary.setEntryText(updateDTO.getDescription());
                    caseDiary.setUpdatedBy(1); // TODO: Get from security context
                    caseDiary.setUpdatedOn(LocalDateTime.now());
                    caseDiaryRepository.save(caseDiary);
                    log.info("✅ Updated case diary entry ID: {}", caseDiary.getDiaryId());
                }
            } else {
                log.warn("⚠️ No case diary entries found for investigation: {}", updateDTO.getInvestigationId());
            }
        }
        
        investigation.setUpdatedBy(1); // TODO: Get from security context
        investigation.setUpdatedOn(LocalDateTime.now());
        
        investigationRepository.save(investigation);
        log.info("✅ Successfully updated investigation: {}", updateDTO.getInvestigationId());
    }

    @Override
    public Optional<CaseDiaryResponseDTO> getCaseDiaryForVictim(String firId) {
        log.info("🔍 Getting case diary for ID: {}", firId);

        try {
            // Check if the ID is a complaint ID or FIR ID
            String actualFirId = firId;
            if (firId.startsWith("CMP_")) {
                log.info("⚠️ Received complaint ID: {}. Need to fetch FIR ID first.", firId);
                // For now, try to construct FIR ID by replacing CMP with FIR
                // This is a temporary solution - ideally frontend should pass FIR ID
                actualFirId = firId.replace("CMP_", "FIR_");
                log.info("🔄 Attempting to use FIR ID: {}", actualFirId);
            }
            
            // Fetch FIR details from complaint service
            log.info("📞 Calling complaint service to fetch FIR details for: {}", actualFirId);
            FirResponseDTO firDetails = complaintFirClient.getFirByFirId(actualFirId);
            log.info("✅ FIR details fetched successfully");
            
            // Query investigations using the actual FIR ID
            List<Investigation> investigations = investigationRepository.findByFirId(actualFirId);
            log.info("🔍 Found {} investigations for FIR ID: {}", investigations.size(), firId);

            // Convert investigations to DTOs
            List<InvestigationDTO> investigationDTOs = investigations.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            // Build case diary response with real data
            CaseDiaryResponseDTO.CaseDiaryResponseDTOBuilder responseBuilder = CaseDiaryResponseDTO.builder()
                    .investigationDetailsList(investigationDTOs)
                    .firNumber(firDetails.getFirId())
                    .sectionId(firDetails.getSections() != null ? firDetails.getSections() : "N/A")
                    .crimeDescription(firDetails.getDescription() != null ? firDetails.getDescription() : "No description available")
                    .filingDateTime(firDetails.getRegisteredOn() != null ? firDetails.getRegisteredOn() : LocalDateTime.now());

            // Set police station and officer details
            responseBuilder
                    .policeStation("Pune Cyber Police Station") // TODO: Fetch from station service
                    .officerName(firDetails.getOfficerId() != null ? "Officer ID: " + firDetails.getOfficerId() : "N/A")
                    .officerPost("Investigating Officer")
                    .officerStation("Pune Cyber Police Station");

            // Add victim details
            if (firDetails.getVictims() != null && !firDetails.getVictims().isEmpty()) {
                StringBuilder victimDetails = new StringBuilder();
                for (Map<String, Object> victim : firDetails.getVictims()) {
                    if (victimDetails.length() > 0) victimDetails.append("; ");
                    victimDetails.append(victim.get("victimName") != null ? victim.get("victimName") : "Unknown")
                            .append(", Age: ").append(victim.get("victimAge") != null ? victim.get("victimAge") : "N/A")
                            .append(", Address: ").append(victim.get("victimAddress") != null ? victim.get("victimAddress") : "N/A")
                            .append(", Mobile: ").append(victim.get("victimMobileNo") != null ? victim.get("victimMobileNo") : "N/A");
                }
                responseBuilder.victimDetails(victimDetails.toString());
            } else {
                responseBuilder.victimDetails("N/A");
            }

            // Add accused/offender details
            if (firDetails.getAccused() != null && !firDetails.getAccused().isEmpty()) {
                StringBuilder offenderDetails = new StringBuilder();
                StringBuilder arrestStatus = new StringBuilder();
                for (Map<String, Object> acc : firDetails.getAccused()) {
                    if (offenderDetails.length() > 0) {
                        offenderDetails.append("; ");
                        arrestStatus.append("; ");
                    }
                    offenderDetails.append(acc.get("accusedName") != null ? acc.get("accusedName") : "Unknown")
                            .append(", Age: ").append(acc.get("accusedAge") != null ? acc.get("accusedAge") : "N/A")
                            .append(", Address: ").append(acc.get("accusedAddress") != null ? acc.get("accusedAddress") : "N/A");
                    arrestStatus.append(acc.get("arrestStatus") != null ? acc.get("arrestStatus") : "Not Arrested");
                }
                responseBuilder.offenderDetails(offenderDetails.toString());
                responseBuilder.arrestStatus(arrestStatus.toString());
            } else {
                responseBuilder.offenderDetails("N/A");
                responseBuilder.arrestStatus("N/A");
            }

            // Add witness details
            if (firDetails.getWitnesses() != null && !firDetails.getWitnesses().isEmpty()) {
                StringBuilder witnessDetails = new StringBuilder();
                StringBuilder witnessContact = new StringBuilder();
                for (Map<String, Object> witness : firDetails.getWitnesses()) {
                    if (witnessDetails.length() > 0) {
                        witnessDetails.append("; ");
                        witnessContact.append("; ");
                    }
                    witnessDetails.append(witness.get("witnessName") != null ? witness.get("witnessName") : "Unknown")
                            .append(", Age: ").append(witness.get("witnessAge") != null ? witness.get("witnessAge") : "N/A");
                    witnessContact.append("Contact: ").append(witness.get("witnessContactNumber") != null ? witness.get("witnessContactNumber") : "N/A")
                            .append(", Address: ").append(witness.get("witnessAddress") != null ? witness.get("witnessAddress") : "N/A");
                }
                responseBuilder.witnessDetails(witnessDetails.toString());
                responseBuilder.witnessContactDetails(witnessContact.toString());
            } else {
                responseBuilder.witnessDetails("N/A");
                responseBuilder.witnessContactDetails("N/A");
            }

            // Set crime date/time - try from root response first, then from complaint
            LocalDateTime crimeDateTime = null;
            
            // Check if crimeDateTime is in root response
            if (firDetails.getCrimeDateTime() != null) {
                crimeDateTime = firDetails.getCrimeDateTime();
            } else if (firDetails.getComplaint() != null && firDetails.getComplaint().get("crimeDateTime") != null) {
                try {
                    crimeDateTime = (LocalDateTime) firDetails.getComplaint().get("crimeDateTime");
                } catch (Exception e) {
                    log.warn("Could not parse crime date/time from complaint: {}", e.getMessage());
                }
            }
            
            if (crimeDateTime != null) {
                responseBuilder.crimeDateTime(crimeDateTime);
            } else {
                // Fall back to registered date if crime date/time not available
                responseBuilder.crimeDateTime(firDetails.getRegisteredOn());
            }

            CaseDiaryResponseDTO response = responseBuilder.build();
            log.info("✅ Case diary response created with {} investigations and full FIR details", investigationDTOs.size());
            return Optional.of(response);

        } catch (Exception e) {
            log.error("❌ Exception in getCaseDiaryForVictim: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    @Override
    public Optional<InvestigationSummaryDTO> getInvestigationForChargesheet(String firId) {
        log.info("🔍 Getting investigation summary for ChargeSheet - FIR ID: {}", firId);
        
        try {
            // Find all investigations for the FIR
            List<Investigation> investigations = investigationRepository.findByFirId(firId);
            
            if (investigations.isEmpty()) {
                log.warn("❌ No investigations found for FIR ID: {}", firId);
                return Optional.empty();
            }
            
            // Get the primary investigation (most recent one)
            Investigation investigation = investigations.get(0);
            log.info("✅ Found investigation ID: {} for FIR ID: {}", investigation.getInvestigationId(), firId);
            
            // Fetch case diary entries
            List<CaseDiary> caseDiaryEntries = caseDiaryRepository.findByInvestigationId(investigation.getInvestigationId());
            log.info("📖 Found {} case diary entries", caseDiaryEntries.size());
            
            // Fetch evidence
            List<Evidence> evidenceList = evidenceRepository.findByInvestigationId(investigation.getInvestigationId());
            log.info("🔬 Found {} evidence items", evidenceList.size());
            
            // Map case diary entries to DTOs
            List<CaseDiaryEntryDTO> caseDiaryDTOs = caseDiaryEntries.stream()
                .map(this::mapToCaseDiaryEntryDTO)
                .collect(Collectors.toList());
            
            // Map evidence to DTOs
            List<com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet.EvidenceDTO> evidenceDTOs = evidenceList.stream()
                .map(this::mapToEvidenceDTO)
                .collect(Collectors.toList());
            
            // Build investigating officer DTO from profile service
            InvestigatingOfficerDTO officerDTO = buildOfficerDTO(investigation.getOfficerId());
            
            // Build investigation summary DTO
            // Investigation code is already the investigationId
            String investigationCode = investigation.getInvestigationId();
            String caseCode = codeGenerator.generateCaseCodeFromFirId(investigation.getFirId());
            
            InvestigationSummaryDTO summary = InvestigationSummaryDTO.builder()
                .investigationId(investigationCode)
                .firId(investigation.getFirId())
                .caseId(caseCode)
                .investigatingOfficer(officerDTO)
                .investigationStatus(investigation.getStatus() != null ? 
                    investigation.getStatus().name() : "IN_PROGRESS")
                .caseDiary(caseDiaryDTOs)
                .evidences(evidenceDTOs)
                .build();
            
            log.info("✅ Investigation summary created successfully for FIR ID: {}", firId);
            return Optional.of(summary);
            
        } catch (Exception e) {
            log.error("❌ Error getting investigation summary for ChargeSheet: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }
    
    private CaseDiaryEntryDTO mapToCaseDiaryEntryDTO(CaseDiary caseDiary) {
        return CaseDiaryEntryDTO.builder()
            .entryId(caseDiary.getDiaryId())
            .entryDate(caseDiary.getEntryDate())
            .entryType("CASE_DIARY") // Default type
            .description(caseDiary.getEntryText())
            .location("N/A") // TODO: Add location to CaseDiary entity if needed
            .officerId(caseDiary.getCreatedBy())
            .officerName("Officer ID: " + caseDiary.getCreatedBy()) // TODO: Fetch from officer service
            .build();
    }
    
    private com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet.EvidenceDTO mapToEvidenceDTO(Evidence evidence) {
        // Generate evidence code if not present
        String evidenceCode = "EVD/MH/PNE/2025/" + String.format("%04d", evidence.getEvidenceId());
        
        return com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet.EvidenceDTO.builder()
            .evidenceId(evidence.getEvidenceId())
            .evidenceCode(evidenceCode)
            .evidenceType(evidence.getEvidenceType())
            .description(evidence.getDescription())
            .location(evidence.getLocationFound())
            .collectedBy(evidence.getCollectedBy())
            .collectedOn(evidence.getCollectedOn())
            .storageLocation("Evidence Room") // TODO: Add to Evidence entity if needed
            .documentPath(evidence.getFilePath())
            .pageCount(0) // TODO: Calculate if document
            .build();
    }

    @Override
    public Optional<FirResponseDTO> getFirDataFromComplaintService(Integer firId) {
        // TODO: Implement FIR data retrieval from complaint service
        return Optional.empty();
    }

    @Override
    public Optional<ComplaintResponseDTO> getComplaintDataFromComplaintService(Long complaintId) {
        // TODO: Implement complaint data retrieval from complaint service
        return Optional.empty();
    }

    @Override
    public com.configserver.officerspro.investigationandcasediaryservice.dto.EvidenceDTO createEvidence(EvidenceRequestDTO requestDTO) {
        // TODO: Implement evidence creation
        throw new UnsupportedOperationException("Evidence creation not implemented");
    }

    @Override
    public com.configserver.officerspro.investigationandcasediaryservice.dto.EvidenceDTO uploadEvidence(Integer investigationId, EvidenceRequestDTO evidenceRequest, MultipartFile file) {
        // TODO: Implement evidence upload
        throw new UnsupportedOperationException("Evidence upload not implemented");
    }

    @Override
    public Optional<com.configserver.officerspro.investigationandcasediaryservice.dto.EvidenceDTO> getEvidenceById(Integer evidenceId) {
        // TODO: Implement evidence retrieval
        throw new UnsupportedOperationException("Evidence retrieval not implemented");
    }

    @Override
    public List<com.configserver.officerspro.investigationandcasediaryservice.dto.EvidenceDTO> getEvidenceByInvestigationId(Integer investigationId) {
        // TODO: Implement evidence retrieval by investigation
        throw new UnsupportedOperationException("Evidence retrieval by investigation not implemented");
    }

    @Override
    public Optional<com.configserver.officerspro.investigationandcasediaryservice.dto.EvidenceDTO> updateEvidence(Integer evidenceId, EvidenceRequestDTO requestDTO) {
        // TODO: Implement evidence update
        throw new UnsupportedOperationException("Evidence update not implemented");
    }

    @Override
    public boolean deleteEvidence(Integer evidenceId) {
        // TODO: Implement evidence deletion
        throw new UnsupportedOperationException("Evidence deletion not implemented");
    }

    private String createInvestigationDirectly(InvestigationUpdateDTO updateDTO) {
        try {
            System.out.println("🔍 Creating investigation for FIR ID: " + updateDTO.getFirId());
            System.out.println("📋 Case status: " + updateDTO.getCaseStatus());
            System.out.println("👤 Offender list size: " + (updateDTO.getOffenderList() != null ? updateDTO.getOffenderList().size() : 0));
            System.out.println("📝 Investigation description: " + (updateDTO.getInvestigationDetails() != null ? updateDTO.getInvestigationDetails().getInvestDescription() : "null"));

            // Validate required fields
            if (updateDTO.getFirId() == null) {
                System.err.println("❌ FIR ID is null in createInvestigationDirectly");
                return "failed";
            }

            // Create new investigation entry with description
            Investigation newInvestigation = Investigation.builder()
                    .firId(updateDTO.getFirId())
                    .officerId(1) // Default officer ID for now
                    .assignedOn(LocalDateTime.now())
                    .status(InvestigationStatus.IN_PROGRESS)
                    .description(updateDTO.getInvestigationDetails() != null ?
                        updateDTO.getInvestigationDetails().getInvestDescription() : "")
                    .createdBy(1)
                    .createdOn(LocalDateTime.now())
                    .build();

            System.out.println("💾 Attempting to save investigation: " + newInvestigation);

            Investigation savedInvestigation = investigationRepository.save(newInvestigation);
            System.out.println("✅ Investigation saved successfully with ID: " + savedInvestigation.getInvestigationId());

            // Verify the save worked
            Optional<Investigation> verifySave = investigationRepository.findById(savedInvestigation.getInternalId());
            if (verifySave.isPresent()) {
                System.out.println("✅ Investigation verified in database: " + verifySave.get());
            } else {
                System.err.println("❌ Investigation not found in database after save!");
            }

            return "success";
        } catch (Exception e) {
            System.err.println("❌ Error in createInvestigationDirectly: " + e.getMessage());
            e.printStackTrace();
            return "failed";
        }
    }

    private InvestigationDTO mapToDTO(Investigation investigation) {
        return InvestigationDTO.builder()
                .internalId(investigation.getInternalId()) // Add unique primary key
                .investigationId(investigation.getInvestigationId())
                .firId(investigation.getFirId())
                .officerId(investigation.getOfficerId())
                .assignedOn(investigation.getAssignedOn())
                .status(investigation.getStatus())
                .description(investigation.getDescription())
                .createdBy(investigation.getCreatedBy())
                .createdOn(investigation.getCreatedOn())
                .updatedBy(investigation.getUpdatedBy())
                .updatedOn(investigation.getUpdatedOn())
                .build();
    }

    private InvestigatingOfficerDTO buildOfficerDTO(Integer officerId) {
        try {
            // Try to fetch officer from profile service
            var response = profileServiceClient.getOfficerById(officerId.toString());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> officer = response.getBody();
                return InvestigatingOfficerDTO.builder()
                    .officerId(officerId)
                    .name((String) officer.get("officerName"))
                    .designation((String) officer.get("officerPost"))
                    .badgeNumber("BADGE-" + officerId) // Badge number not in profile service yet
                    .contactNumber((String) officer.get("officerMobileNo"))
                    .email((String) officer.get("officerEmail"))
                    .build();
            }
        } catch (Exception e) {
            log.error("Failed to fetch officer from profile service: {}", e.getMessage());
        }
        
        // Fallback to minimal officer data
        return InvestigatingOfficerDTO.builder()
            .officerId(officerId)
            .name("Officer ID: " + officerId)
            .designation("Investigating Officer")
            .badgeNumber("BADGE-" + officerId)
            .contactNumber("N/A")
            .email("officer" + officerId + "@police.gov.in")
            .build();
    }

    public Optional<Investigation> findLatestActiveInvestigation(String firId) {
        List<Investigation> list = investigationRepository.findLatestActive(firId);
        if (list.isEmpty()) return Optional.empty();
        return Optional.of(list.get(0)); // latest investigation
    }


}




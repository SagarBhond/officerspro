package com.configserver.officerspro.courtcasemanagementservice.service;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.ChargesheetSubmissionDto;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.enums.CaseStatus;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChargesheetSubmissionHandler {

    private static final Logger log = LoggerFactory.getLogger(ChargesheetSubmissionHandler.class);
    
    private final CourtCaseRepository courtCaseRepository;

    public ChargesheetSubmissionHandler(CourtCaseRepository courtCaseRepository) {
        this.courtCaseRepository = courtCaseRepository;
    }

    /**
     * Handle chargesheet submission notification
     * Creates new court case for first submission, updates existing for subsequent versions
     */
    @Transactional
    public void handleSubmission(ChargesheetSubmissionDto dto) {
        log.info("Processing chargesheet submission: {} for FIR: {}", dto.getChargesheetId(), dto.getFirId());
        
        // Check if court case already exists for this FIR
        Optional<CourtCase> existingCase = courtCaseRepository.findByFirId(dto.getFirId());
        
        if (existingCase.isPresent()) {
            // UPDATE: Existing court case - update currentChargesheetId
            updateExistingCourtCase(existingCase.get(), dto);
        } else {
            // CREATE: New court case
            createNewCourtCase(dto);
        }
    }

    /**
     * Update existing court case with new chargesheet version
     */
    private void updateExistingCourtCase(CourtCase courtCase, ChargesheetSubmissionDto dto) {
        log.info("Updating existing court case {} with new chargesheet: {}", 
                courtCase.getCaseId(), dto.getChargesheetId());
        
        // Update current chargesheet ID to the latest submitted version
        courtCase.setCurrentChargesheetId(dto.getChargesheetId());
        
        courtCaseRepository.save(courtCase);
        
        log.info("Court case {} updated successfully", courtCase.getCaseId());
    }

    /**
     * Create new court case for first chargesheet submission
     */
    private void createNewCourtCase(ChargesheetSubmissionDto dto) {
        log.info("Creating new court case for FIR: {}", dto.getFirId());
        
        CourtCase courtCase = new CourtCase();
        
        // Generate unique case number
        courtCase.setCaseNumber(generateCaseNumber());
        
        // Set FIR and chargesheet IDs
        courtCase.setFirId(dto.getFirId());
        courtCase.setChargesheetId(dto.getChargesheetId());
        courtCase.setCurrentChargesheetId(dto.getChargesheetId());
        
        // Set initial status
        courtCase.setStatus(CaseStatus.REGISTERED);
        
        // Set creation metadata
        courtCase.setCreatedOn(LocalDateTime.now());
        courtCase.setCreatedBy(1L); // System user for auto-registration
        
        courtCaseRepository.save(courtCase);
        
        log.info("Court case created successfully with number: {}", courtCase.getCaseNumber());
    }

    /**
     * Generate unique case number
     * Format: CASE-YYYY-XXXXXX
     */
    private String generateCaseNumber() {
        int year = LocalDateTime.now().getYear();
        String uniqueId = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("CASE-%d-%s", year, uniqueId);
    }
}

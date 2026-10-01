package com.configserver.officerspro.courtcasemanagementservice.controller;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.CourtCaseRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.ChargesheetSubmissionDto;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.CourtCaseResponse;
import com.configserver.officerspro.courtcasemanagementservice.enums.CaseStatus;
import com.configserver.officerspro.courtcasemanagementservice.service.CourtCaseService;
import com.configserver.officerspro.courtcasemanagementservice.service.ChargesheetSubmissionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courtcases")
public class CourtCaseController {

    private static final Logger logger = LoggerFactory.getLogger(CourtCaseController.class);
    private final CourtCaseService courtCaseService;
    private final ChargesheetSubmissionHandler chargesheetSubmissionHandler;

    public CourtCaseController(CourtCaseService courtCaseService,
                              ChargesheetSubmissionHandler chargesheetSubmissionHandler) {
        this.courtCaseService = courtCaseService;
        this.chargesheetSubmissionHandler = chargesheetSubmissionHandler;
    }

    @PostMapping
    public ResponseEntity<CourtCaseResponse> registerCourtCase(@RequestBody CourtCaseRequest request) {
        logger.info("Received request to register court case: {}", request.getCaseNumber());
        try {
            CourtCaseResponse response = courtCaseService.registerCourtCase(request);
            logger.info("Successfully registered court case: {}", response.getCaseId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error registering court case: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<Page<CourtCaseResponse>> getCourtCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String caseNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdOn") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        logger.info("Received request to get court cases with filters: status={}, caseNumber={}, page={}, size={}", 
                   status, caseNumber, page, size);
        
        CaseStatus caseStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                caseStatus = CaseStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status value: {}", status);
                // Continue with null status
            }
        }
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<CourtCaseResponse> response = courtCaseService.getCourtCases(caseStatus, caseNumber, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourtCaseResponse>> searchByCaseNumber(@RequestParam String caseNumber) {
        logger.info("Received request to search court cases by case number: {}", caseNumber);
        List<CourtCaseResponse> response = courtCaseService.searchByCaseNumber(caseNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<CourtCaseResponse> getCourtCase(@PathVariable Long caseId) {
        logger.info("Received request to get court case: {}", caseId);
        return ResponseEntity.ok(courtCaseService.getCourtCase(caseId));
    }

    @PutMapping("/{caseId}")
    public ResponseEntity<CourtCaseResponse> updateCourtCase(@PathVariable Long caseId,
                                                             @RequestBody CourtCaseRequest request) {
        logger.info("Received request to update court case: {}", caseId);
        return ResponseEntity.ok(courtCaseService.updateCourtCase(caseId, request));
    }

    @DeleteMapping("/{caseId}")
    public ResponseEntity<Void> deleteCourtCase(@PathVariable Long caseId) {
        logger.info("Received request to delete court case: {}", caseId);
        courtCaseService.deleteCourtCase(caseId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{caseId}/current-chargesheet")
    public ResponseEntity<CourtCaseResponse> updateCurrentChargesheet(
            @PathVariable Long caseId,
            @RequestBody UpdateChargesheetRequest request) {
        logger.info("Received request to update current chargesheet for case: {} to chargesheet: {}", 
                   caseId, request.getChargesheetId());
        CourtCaseResponse response = courtCaseService.updateCurrentChargesheet(caseId, request.getChargesheetId());
        return ResponseEntity.ok(response);
    }

    // Inner class for request body
    public static class UpdateChargesheetRequest {
        private String chargesheetId;

        public String getChargesheetId() {
            return chargesheetId;
        }

        public void setChargesheetId(String chargesheetId) {
            this.chargesheetId = chargesheetId;
        }
    }
    
    /**
     * Notification endpoint called by Chargesheet Service when a chargesheet is submitted
     * Automatically creates or updates court case
     */
    @PostMapping("/notification/chargesheet-submitted")
    public ResponseEntity<Void> handleChargesheetSubmission(@RequestBody ChargesheetSubmissionDto dto) {
        logger.info("Received chargesheet submission notification: {} for FIR: {}", 
                   dto.getChargesheetId(), dto.getFirId());
        try {
            chargesheetSubmissionHandler.handleSubmission(dto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error handling chargesheet submission: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Sync court tracking ID from mock court API
     * In production, this would call the real government court API
     */
    @PostMapping("/{caseId}/sync-tracking")
    public ResponseEntity<CourtCaseResponse> syncCourtTracking(@PathVariable Long caseId) {
        logger.info("Syncing court tracking for case: {}", caseId);
        try {
            courtCaseService.syncCourtTracking(caseId);
            CourtCaseResponse response = courtCaseService.getCourtCase(caseId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error syncing court tracking: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    
    /**
     * Sync hearings from mock court API
     * In production, this would call the real government court API
     */
    @PostMapping("/{caseId}/sync-hearings")
    public ResponseEntity<Void> syncHearings(@PathVariable Long caseId) {
        logger.info("Syncing hearings for case: {}", caseId);
        try {
            courtCaseService.syncHearings(caseId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error syncing hearings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Sync judgments from mock court API
     * In production, this would call the real government court API
     */
    @PostMapping("/{caseId}/sync-judgments")
    public ResponseEntity<Void> syncJudgments(@PathVariable Long caseId) {
        logger.info("Syncing judgments for case: {}", caseId);
        try {
            courtCaseService.syncJudgments(caseId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error syncing judgments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

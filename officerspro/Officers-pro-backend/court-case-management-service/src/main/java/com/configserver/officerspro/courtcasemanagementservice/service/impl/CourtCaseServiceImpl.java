package com.configserver.officerspro.courtcasemanagementservice.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.CourtCaseRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.CourtCaseResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.enums.CaseStatus;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.InvalidInputException;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.ResourceNotFoundException;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseRepository;
import com.configserver.officerspro.courtcasemanagementservice.service.CourtApiSyncService;

@Service
@Transactional
public class CourtCaseServiceImpl implements com.configserver.officerspro.courtcasemanagementservice.service.CourtCaseService {

    private final CourtCaseRepository courtCaseRepository;
    private final CourtApiSyncService courtApiSyncService;
    
    public CourtCaseServiceImpl(CourtCaseRepository courtCaseRepository,
                                CourtApiSyncService courtApiSyncService) {
        this.courtCaseRepository = courtCaseRepository;
        this.courtApiSyncService = courtApiSyncService;
    }

    @Override
    public CourtCaseResponse registerCourtCase(CourtCaseRequest req) {
        // Validate: One FIR can have only one court case
        if (req.getFirId() != null && !req.getFirId().trim().isEmpty()) {
            Optional<CourtCase> existingCase = courtCaseRepository.findByFirId(req.getFirId());
            if (existingCase.isPresent()) {
                throw new InvalidInputException(
                    "A court case already exists for FIR: " + req.getFirId() + 
                    ". Case Number: " + existingCase.get().getCaseNumber() + 
                    " (Case ID: " + existingCase.get().getCaseId() + ")"
                );
            }
        }
        
        CourtCase cc = new CourtCase();
        cc.setCaseNumber(req.getCaseNumber());
        cc.setChargesheetId(req.getChargesheetId());
        cc.setFirId(req.getFirId());
        cc.setCourtName(req.getCourtName());
        // Set court tracking ID if provided
        cc.setCourtTrackingId(req.getCourtTrackingId());
        // Track the latest chargesheet for document filtering and UI
        cc.setCurrentChargesheetId(req.getChargesheetId());
        cc.setStatus(CaseStatus.REGISTERED);
        cc.setCreatedOn(LocalDateTime.now());
        cc.setCreatedBy(101L); // Default user ID since not in DTO

        cc = courtCaseRepository.save(cc);

        return toResponse(cc);
    }

    @Override
    @Transactional(readOnly = true)
    public CourtCaseResponse getCourtCase(Long caseId) {
        CourtCase cc = courtCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        return toResponse(cc);
    }

    @Override
    public CourtCaseResponse updateCourtCase(Long caseId, CourtCaseRequest req) {
        CourtCase cc = courtCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));

        if (req.getCourtName() != null) cc.setCourtName(req.getCourtName());
        // Note: status is not in DTO, so we can't update it from request
        // keep other fields immutable for update (per your API table)

        cc = courtCaseRepository.save(cc);
        return toResponse(cc);
    }

    @Override
    public void deleteCourtCase(Long caseId) {
        CourtCase cc = courtCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        // Soft delete: set status CLOSED
        // Note: Cases are also automatically set to CLOSED when a judgment is recorded (see JudgmentServiceImpl)
        cc.setStatus(CaseStatus.CLOSED);
        courtCaseRepository.save(cc);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourtCaseResponse> getCourtCases(CaseStatus status, String caseNumber, Pageable pageable) {
        Page<CourtCase> cases;
        
        if (status != null && caseNumber != null && !caseNumber.trim().isEmpty()) {
            cases = courtCaseRepository.findByStatusAndCaseNumberContaining(status, caseNumber, pageable);
        } else if (status != null) {
            cases = courtCaseRepository.findByStatus(status, pageable);
        } else if (caseNumber != null && !caseNumber.trim().isEmpty()) {
            List<CourtCase> caseList = courtCaseRepository.findByCaseNumberContaining(caseNumber);
            // Convert to page manually for simplicity
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), caseList.size());
            List<CourtCase> pageContent = caseList.subList(start, end);
            cases = new PageImpl<>(pageContent, pageable, caseList.size());
        } else {
            cases = courtCaseRepository.findAll(pageable);
        }
        
        return cases.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourtCaseResponse> searchByCaseNumber(String caseNumber) {
        if (caseNumber == null || caseNumber.trim().isEmpty()) {
            throw new InvalidInputException("Case number is required for search");
        }
        
        List<CourtCase> cases = courtCaseRepository.findByCaseNumberContaining(caseNumber);
        return cases.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public CourtCaseResponse updateCurrentChargesheet(Long caseId, String chargesheetId) {
        if (chargesheetId == null || chargesheetId.trim().isEmpty()) {
            throw new InvalidInputException("Chargesheet ID is required");
        }
        
        CourtCase cc = courtCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        
        // Validate that the chargesheet belongs to the same FIR
        if (cc.getFirId() != null && !cc.getFirId().trim().isEmpty()) {
            // Note: In a real scenario, you might want to validate against chargesheet service
            // that this chargesheetId belongs to the same firId
            // For now, we'll just update it
        }
        
        cc.setCurrentChargesheetId(chargesheetId);
        cc = courtCaseRepository.save(cc);
        
        return toResponse(cc);
    }
    
    @Override
    public void syncCourtTracking(Long caseId) {
        courtApiSyncService.syncCourtTracking(caseId);
    }
    
    @Override
    public void syncHearings(Long caseId) {
        courtApiSyncService.syncHearings(caseId);
    }
    
    @Override
    public void syncJudgments(Long caseId) {
        courtApiSyncService.syncJudgments(caseId);
    }

    private CourtCaseResponse toResponse(CourtCase cc) {
        CourtCaseResponse res = new CourtCaseResponse();
        res.setCaseId(cc.getCaseId());
        res.setCaseNumber(cc.getCaseNumber());
        res.setCourtName(cc.getCourtName());
        res.setStatus(cc.getStatus().toString()); // Convert enum to String
        res.setCreatedOn(cc.getCreatedOn());
        res.setChargesheetId(cc.getChargesheetId());
        res.setFirId(cc.getFirId());
        res.setCourtTrackingId(cc.getCourtTrackingId());
        res.setCurrentChargesheetId(cc.getCurrentChargesheetId());
        return res;
    }
}

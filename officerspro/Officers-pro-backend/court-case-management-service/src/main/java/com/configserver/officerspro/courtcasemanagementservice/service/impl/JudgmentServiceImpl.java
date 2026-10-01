package com.configserver.officerspro.courtcasemanagementservice.service.impl;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.JudgmentRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.JudgmentResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtHearing;
import com.configserver.officerspro.courtcasemanagementservice.entity.Judgment;
import com.configserver.officerspro.courtcasemanagementservice.enums.CaseStatus;
import com.configserver.officerspro.courtcasemanagementservice.enums.HearingStatus;
import com.configserver.officerspro.courtcasemanagementservice.enums.JudgmentOutcome;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.InvalidInputException;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.ResourceNotFoundException;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtHearingRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.JudgmentRepository;

@Service
@Transactional
public class JudgmentServiceImpl implements com.configserver.officerspro.courtcasemanagementservice.service.JudgmentService {

    private final CourtCaseRepository caseRepo;
    private final CourtHearingRepository hearingRepo;
    private final JudgmentRepository judgmentRepo;

    public JudgmentServiceImpl(CourtCaseRepository caseRepo,
                               CourtHearingRepository hearingRepo,
                               JudgmentRepository judgmentRepo) {
        this.caseRepo = caseRepo;
        this.hearingRepo = hearingRepo;
        this.judgmentRepo = judgmentRepo;
    }

    // Hearing-scoped methods (new)
    @Override
    public JudgmentResponse recordJudgment(Long caseId, Long hearingId, JudgmentRequest req) {
        // Validate case exists
        CourtCase cc = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        
        // Validate hearing exists and belongs to case
        CourtHearing h = hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));

        // Validate: Only one judgment per hearing
        Optional<Judgment> existingJudgment = judgmentRepo.findFirstByCaseIdAndHearingId(caseId, hearingId);
        if (existingJudgment.isPresent()) {
            throw new InvalidInputException(
                "A judgment already exists for this hearing (Judgment ID: " + 
                existingJudgment.get().getJudgmentId() + 
                "). Please use the update endpoint to modify it."
            );
        }

        if (req.getSummary() == null || req.getOutcome() == null) {
            throw new InvalidInputException("summary and outcome are required");
        }

        Judgment j = new Judgment();
        j.setCaseId(caseId);
        j.setCourtCase(cc);
        j.setHearingId(hearingId);
        j.setCourtHearing(h);
        j.setSummary(req.getSummary());
        j.setOutcome(JudgmentOutcome.valueOf(req.getOutcome()));
        j.setJudgmentDate(req.getJudgmentDate() != null ? req.getJudgmentDate() : LocalDate.now());
        j.setRecordedBy(101L);
        j.setRecordedOn(LocalDateTime.now());
        j = judgmentRepo.save(j);

        // Update hearing status to COMPLETED when judgment is recorded
        // Note: Case status remains unchanged - it should be manually closed by the user
        h.setStatus(HearingStatus.COMPLETED);
        hearingRepo.save(h);

        return toResponse(j);
    }
    
    @Override
    public JudgmentResponse updateJudgment(Long caseId, Long hearingId, Long judgmentId, JudgmentRequest req) {
        // Validate case exists
        CourtCase cc = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        
        // Validate hearing exists and belongs to case
        CourtHearing h = hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        // Find existing judgment
        Judgment j = judgmentRepo.findByJudgmentIdAndCaseIdAndHearingId(judgmentId, caseId, hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Judgment not found: " + judgmentId));

        if (req.getSummary() != null) {
            j.setSummary(req.getSummary());
        }
        if (req.getOutcome() != null) {
            j.setOutcome(JudgmentOutcome.valueOf(req.getOutcome()));
        }
        if (req.getJudgmentDate() != null) {
            j.setJudgmentDate(req.getJudgmentDate());
        }
        // Update recorded timestamp
        j.setRecordedOn(LocalDateTime.now());
        
        j = judgmentRepo.save(j);

        return toResponse(j);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JudgmentResponse> getJudgmentsByHearing(Long caseId, Long hearingId) {
        // Validate case and hearing exist
        caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        return judgmentRepo.findByCaseIdAndHearingId(caseId, hearingId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JudgmentResponse getJudgment(Long caseId, Long hearingId, Long judgmentId) {
        Judgment j = judgmentRepo.findByJudgmentIdAndCaseIdAndHearingId(judgmentId, caseId, hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Judgment not found: " + judgmentId));
        return toResponse(j);
    }

    // Case-scoped methods (for backward compatibility)
    @Override
    public JudgmentResponse recordJudgment(Long caseId, JudgmentRequest req) {
        // For backward compatibility, we need a default hearing or throw error
        throw new InvalidInputException("Please specify hearingId. Use recordJudgment(caseId, hearingId, request) instead.");
    }

    @Override
    @Transactional(readOnly = true)
    public JudgmentResponse getJudgment(Long caseId) {
        caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        
        List<Judgment> judgments = judgmentRepo.findByCaseIdOrderByRecordedOnDesc(caseId);
        if (judgments.isEmpty()) {
            throw new ResourceNotFoundException("Judgment not found for caseId: " + caseId);
        }
        
        return toResponse(judgments.get(0)); // Return the latest judgment
    }

    private JudgmentResponse toResponse(Judgment j) {
        JudgmentResponse res = new JudgmentResponse();
        res.setJudgmentId(j.getJudgmentId());
        res.setCaseId(j.getCaseId());
        res.setHearingId(j.getHearingId());
        res.setSummary(j.getSummary());
        res.setOutcome(j.getOutcome().toString());
        res.setJudgmentDate(j.getJudgmentDate());
        return res;
    }
}

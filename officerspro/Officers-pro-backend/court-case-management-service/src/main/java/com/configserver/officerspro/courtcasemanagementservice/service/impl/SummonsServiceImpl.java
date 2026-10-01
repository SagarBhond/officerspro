package com.configserver.officerspro.courtcasemanagementservice.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.SummonsRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.StatusUpdateRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.SummonsResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtHearing;
import com.configserver.officerspro.courtcasemanagementservice.entity.Summons;
import com.configserver.officerspro.courtcasemanagementservice.enums.SummonsStatus;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.InvalidInputException;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.ResourceNotFoundException;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtHearingRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.SummonsRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.HearingParticipantRepository;
import com.configserver.officerspro.courtcasemanagementservice.entity.HearingParticipant;

@Service
@Transactional
public class SummonsServiceImpl implements com.configserver.officerspro.courtcasemanagementservice.service.SummonsService {

    private final CourtCaseRepository caseRepo;
    private final CourtHearingRepository hearingRepo;
    private final SummonsRepository summonsRepo;
    private final HearingParticipantRepository participantRepo;

    public SummonsServiceImpl(CourtCaseRepository caseRepo,
                              CourtHearingRepository hearingRepo,
                              SummonsRepository summonsRepo,
                              HearingParticipantRepository participantRepo) {
        this.caseRepo = caseRepo;
        this.hearingRepo = hearingRepo;
        this.summonsRepo = summonsRepo;
        this.participantRepo = participantRepo;
    }

    // Hearing-scoped methods (new)
    @Override
    public SummonsResponse issueSummons(Long caseId, Long hearingId, SummonsRequest req) {
        // Validate case exists
        CourtCase cc = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        
        // Validate hearing exists and belongs to case
        CourtHearing h = hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));

        if (req.getRecipientId() == null || req.getAppearanceDate() == null) {
            throw new InvalidInputException("recipientId and appearanceDate are required");
        }

        // Validate that the recipientId corresponds to a participant in this hearing
        HearingParticipant participant = participantRepo.findByIdAndHearingId(req.getRecipientId(), hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found in this hearing: " + req.getRecipientId()));

        Summons s = new Summons();
        s.setCaseId(caseId);
        s.setCourtCase(cc);
        s.setHearingId(hearingId);
        s.setCourtHearing(h);
        s.setRecipientId(req.getRecipientId());
        s.setRecipientType(participant.getRole().toString()); // Use participant's role as recipient type
        s.setIssuedAt(LocalDateTime.now());
        s.setAppearanceDate(req.getAppearanceDate());
        s.setStatus(SummonsStatus.ISSUED);
        s = summonsRepo.save(s);

        return toResponse(s);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SummonsResponse> getSummonsByHearing(Long caseId, Long hearingId) {
        // Validate case and hearing exist
        caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        return summonsRepo.findByCaseIdAndHearingId(caseId, hearingId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SummonsResponse getSummons(Long caseId, Long hearingId, Long summonsId) {
        Summons s = summonsRepo.findBySummonsIdAndCaseIdAndHearingId(summonsId, caseId, hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Summons not found: " + summonsId));
        return toResponse(s);
    }

    @Override
    public SummonsResponse updateSummons(Long caseId, Long hearingId, Long summonsId, SummonsRequest req) {
        Summons s = summonsRepo.findBySummonsIdAndCaseIdAndHearingId(summonsId, caseId, hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Summons not found: " + summonsId));
        
        if (req.getRecipientId() != null) s.setRecipientId(req.getRecipientId());
        if (req.getRecipientType() != null) s.setRecipientType(req.getRecipientType());
        if (req.getAppearanceDate() != null) s.setAppearanceDate(req.getAppearanceDate());
        
        s = summonsRepo.save(s);
        return toResponse(s);
    }

    @Override
    public void deleteSummons(Long caseId, Long hearingId, Long summonsId) {
        Summons s = summonsRepo.findBySummonsIdAndCaseIdAndHearingId(summonsId, caseId, hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Summons not found: " + summonsId));
        
        summonsRepo.delete(s);
    }

    @Override
    public SummonsResponse updateSummonsStatus(Long caseId, Long hearingId, Long summonsId, StatusUpdateRequest req) {
        Summons s = summonsRepo.findBySummonsIdAndCaseIdAndHearingId(summonsId, caseId, hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Summons not found: " + summonsId));
        
        if (req.getStatus() == null || req.getStatus().trim().isEmpty()) {
            throw new InvalidInputException("Status is required");
        }
        
        try {
            SummonsStatus newStatus = SummonsStatus.valueOf(req.getStatus().toUpperCase());
            s.setStatus(newStatus);
            s = summonsRepo.save(s);
            return toResponse(s);
        } catch (IllegalArgumentException e) {
            throw new InvalidInputException("Invalid summons status: " + req.getStatus());
        }
    }

    // Case-scoped methods (for backward compatibility)
    @Override
    public SummonsResponse issueSummons(Long caseId, SummonsRequest req) {
        // For backward compatibility, we need a default hearing or throw error
        throw new InvalidInputException("Please specify hearingId. Use issueSummons(caseId, hearingId, request) instead.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SummonsResponse> getSummons(Long caseId) {
        caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));
        return summonsRepo.findByCaseId(caseId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public SummonsResponse updateSummons(Long caseId, Long summonsId, SummonsRequest req) {
        Summons s = summonsRepo.findById(summonsId)
                .orElseThrow(() -> new ResourceNotFoundException("Summons not found: " + summonsId));
        if (!s.getCaseId().equals(caseId)) {
            throw new InvalidInputException("Summons does not belong to caseId=" + caseId);
        }
        
        if (req.getRecipientId() != null) s.setRecipientId(req.getRecipientId());
        if (req.getRecipientType() != null) s.setRecipientType(req.getRecipientType());
        if (req.getAppearanceDate() != null) s.setAppearanceDate(req.getAppearanceDate());
        
        s = summonsRepo.save(s);
        return toResponse(s);
    }

    private SummonsResponse toResponse(Summons s) {
        SummonsResponse res = new SummonsResponse();
        res.setSummonsId(s.getSummonsId());
        res.setCaseId(s.getCaseId());
        res.setHearingId(s.getHearingId());
        res.setRecipientId(s.getRecipientId());
        res.setRecipientType(s.getRecipientType());
        res.setAppearanceDate(s.getAppearanceDate());
        res.setIssuedAt(s.getIssuedAt());
        res.setStatus(s.getStatus().toString());
        
        // Try to get participant name if available
        if (s.getRecipientId() != null && s.getHearingId() != null) {
            participantRepo.findByIdAndHearingId(s.getRecipientId(), s.getHearingId())
                    .ifPresent(participant -> res.setRecipientName(participant.getName()));
        }
        
        return res;
    }
}

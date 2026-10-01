package com.configserver.officerspro.courtcasemanagementservice.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.HearingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.HearingParticipantRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.StatusUpdateRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingParticipantResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtHearing;
import com.configserver.officerspro.courtcasemanagementservice.entity.HearingParticipant;
import com.configserver.officerspro.courtcasemanagementservice.enums.HearingStatus;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.InvalidInputException;
import com.configserver.officerspro.courtcasemanagementservice.exceptions.ResourceNotFoundException;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtHearingRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.HearingParticipantRepository;

@Service
@Transactional
public class HearingServiceImpl implements com.configserver.officerspro.courtcasemanagementservice.service.HearingService {

    private final CourtCaseRepository caseRepo;
    private final CourtHearingRepository hearingRepo;
    private final HearingParticipantRepository participantRepo;

    public HearingServiceImpl(CourtCaseRepository caseRepo,
                              CourtHearingRepository hearingRepo,
                              HearingParticipantRepository participantRepo) {
        this.caseRepo = caseRepo;
        this.hearingRepo = hearingRepo;
        this.participantRepo = participantRepo;
    }

    @Override
    public HearingResponse scheduleHearing(Long caseId, HearingRequest req) {
        CourtCase cc = caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));

        if (req.getScheduledAt() == null || req.getVenue() == null) {
            throw new InvalidInputException("scheduledAt and venue are required");
        }

        CourtHearing h = new CourtHearing();
        h.setCaseId(caseId);
        h.setCourtCase(cc);
        h.setScheduledAt(req.getScheduledAt());
        h.setVenue(req.getVenue());
        h.setStatus(HearingStatus.UPCOMING);
        // Note: remarks is not in DTO, so we can't set it from request
        h = hearingRepo.save(h);

        return toResponse(h);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HearingResponse> getHearingsByCase(Long caseId, String status) {
        caseRepo.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Court case not found: " + caseId));

        List<CourtHearing> list;
        if (status == null) {
            list = hearingRepo.findByCaseId(caseId);
        } else {
            HearingStatus hearingStatus = HearingStatus.valueOf(status.toUpperCase());
            list = hearingRepo.findByCaseIdAndStatus(caseId, hearingStatus);
        }

        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public HearingResponse updateHearing(Long caseId, Long hearingId, HearingRequest req) {
        CourtHearing h = hearingRepo.findById(hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        if (!h.getCaseId().equals(caseId)) {
            throw new InvalidInputException("Hearing does not belong to caseId=" + caseId);
        }
        
        if (req.getScheduledAt() != null) h.setScheduledAt(req.getScheduledAt());
        if (req.getVenue() != null) h.setVenue(req.getVenue());
        
        h = hearingRepo.save(h);
        return toResponse(h);
    }

    @Override
    @Transactional(readOnly = true)
    public HearingResponse getHearing(Long caseId, Long hearingId) {
        CourtHearing h = hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        return toResponse(h);
    }

    @Override
    public void deleteHearing(Long caseId, Long hearingId) {
        CourtHearing h = hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        hearingRepo.delete(h);
    }

    @Override
    public HearingResponse updateHearingStatus(Long caseId, Long hearingId, StatusUpdateRequest req) {
        CourtHearing h = hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        if (req.getStatus() == null || req.getStatus().trim().isEmpty()) {
            throw new InvalidInputException("Status is required");
        }
        
        try {
            HearingStatus newStatus = HearingStatus.valueOf(req.getStatus().toUpperCase());
            h.setStatus(newStatus);
            h = hearingRepo.save(h);
            return toResponse(h);
        } catch (IllegalArgumentException e) {
            throw new InvalidInputException("Invalid hearing status: " + req.getStatus());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<HearingParticipantResponse> getHearingParticipants(Long caseId, Long hearingId) {
        // Validate hearing belongs to case
        hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        List<HearingParticipant> participants = participantRepo.findByCourtHearing_HearingId(hearingId);
        return participants.stream().map(this::toParticipantResponse).collect(Collectors.toList());
    }

    @Override
    public HearingParticipantResponse addHearingParticipant(Long caseId, Long hearingId, HearingParticipantRequest req) {
        // Validate hearing belongs to case
        CourtHearing h = hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        if (req.getName() == null || req.getName().trim().isEmpty() || req.getRole() == null) {
            throw new InvalidInputException("name and role are required");
        }
        
        HearingParticipant p = new HearingParticipant();
        // participantId will be auto-generated, no need to set from request
        p.setName(req.getName());
        p.setRole(req.getRole());
        p.setCourtHearing(h);
        
        p = participantRepo.save(p);
        
        return toParticipantResponse(p);
    }

    @Override
    public void deleteHearingParticipant(Long caseId, Long hearingId, Long participantId) {
        // Validate hearing belongs to case
        hearingRepo.findByHearingIdAndCaseId(hearingId, caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found: " + hearingId));
        
        HearingParticipant p = participantRepo.findByIdAndHearingId(participantId, hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: " + participantId));
        
        participantRepo.delete(p);
    }

    private HearingResponse toResponse(CourtHearing h) {
        HearingResponse res = new HearingResponse();
        res.setHearingId(h.getHearingId());
        res.setCaseId(h.getCaseId());
        res.setScheduledAt(h.getScheduledAt());
        res.setStatus(h.getStatus().toString()); // Convert enum to String
        return res;
    }

    private HearingParticipantResponse toParticipantResponse(HearingParticipant p) {
        HearingParticipantResponse res = new HearingParticipantResponse();
        res.setId(p.getId());
        res.setParticipantId(p.getParticipantId());
        res.setName(p.getName());
        res.setRole(p.getRole());
        return res;
    }
}

package com.configserver.officerspro.courtcasemanagementservice.service;

import java.util.List;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.HearingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.HearingParticipantRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.StatusUpdateRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingParticipantResponse;

public interface HearingService {
    HearingResponse scheduleHearing(Long caseId, HearingRequest req);
    List<HearingResponse> getHearingsByCase(Long caseId, String status);
    HearingResponse updateHearing(Long caseId, Long hearingId, HearingRequest req);
    
    // New methods for hearing management
    HearingResponse getHearing(Long caseId, Long hearingId);
    void deleteHearing(Long caseId, Long hearingId);
    HearingResponse updateHearingStatus(Long caseId, Long hearingId, StatusUpdateRequest req);
    
    // Participant management
    List<HearingParticipantResponse> getHearingParticipants(Long caseId, Long hearingId);
    HearingParticipantResponse addHearingParticipant(Long caseId, Long hearingId, HearingParticipantRequest req);
    void deleteHearingParticipant(Long caseId, Long hearingId, Long participantId);
}

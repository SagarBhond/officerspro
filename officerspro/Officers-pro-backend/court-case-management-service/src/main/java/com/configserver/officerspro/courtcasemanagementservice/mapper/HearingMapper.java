package com.configserver.officerspro.courtcasemanagementservice.mapper;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.HearingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtHearing;
import com.configserver.officerspro.courtcasemanagementservice.enums.HearingStatus;

public class HearingMapper {
    
    public static CourtHearing toEntity(Long caseId, HearingRequest request) {
        CourtHearing hearing = new CourtHearing();
        hearing.setCaseId(caseId);
        hearing.setScheduledAt(request.getScheduledAt());
        hearing.setVenue(request.getVenue());
        hearing.setStatus(HearingStatus.UPCOMING);
        return hearing;
    }
    
    public static HearingResponse toResponse(CourtHearing entity) {
        HearingResponse response = new HearingResponse();
        response.setHearingId(entity.getHearingId());
        response.setCaseId(entity.getCaseId());
        response.setScheduledAt(entity.getScheduledAt());
        response.setStatus(entity.getStatus().toString());
        return response;
    }
}

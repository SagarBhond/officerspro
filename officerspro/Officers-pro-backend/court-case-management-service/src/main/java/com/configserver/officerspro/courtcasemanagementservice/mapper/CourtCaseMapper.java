package com.configserver.officerspro.courtcasemanagementservice.mapper;

import com.configserver.officerspro.courtcasemanagementservice.dto.response.CourtCaseResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;

public class CourtCaseMapper {
    
    public static CourtCaseResponse toResponse(CourtCase entity) {
        CourtCaseResponse response = new CourtCaseResponse();
        response.setCaseId(entity.getCaseId());
        response.setCaseNumber(entity.getCaseNumber());
        response.setCourtName(entity.getCourtName());
        response.setStatus(entity.getStatus().toString());
        response.setCreatedOn(entity.getCreatedOn());
        return response;
    }
}

package com.configserver.officerspro.courtcasemanagementservice.mapper;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.SummonsRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.SummonsResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.Summons;
import com.configserver.officerspro.courtcasemanagementservice.enums.SummonsStatus;

import java.time.LocalDateTime;

public class SummonsMapper {
    
    public static Summons toEntity(Long caseId, SummonsRequest request) {
        Summons summons = new Summons();
        summons.setCaseId(caseId);
        summons.setRecipientId(request.getRecipientId());
        summons.setRecipientType(request.getRecipientType());
        summons.setIssuedAt(LocalDateTime.now());
        summons.setAppearanceDate(request.getAppearanceDate());
        summons.setStatus(SummonsStatus.ISSUED);
        return summons;
    }
    
    public static SummonsResponse toResponse(Summons entity) {
        SummonsResponse response = new SummonsResponse();
        response.setSummonsId(entity.getSummonsId());
        response.setCaseId(entity.getCaseId());
        response.setStatus(entity.getStatus().toString());
        return response;
    }
}

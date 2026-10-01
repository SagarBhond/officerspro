package com.configserver.officerspro.courtcasemanagementservice.mapper;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.JudgmentRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.JudgmentResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.Judgment;
import com.configserver.officerspro.courtcasemanagementservice.enums.JudgmentOutcome;

import java.time.LocalDateTime;

public class JudgmentMapper {
    
    public static Judgment toEntity(Long caseId, JudgmentRequest request) {
        Judgment judgment = new Judgment();
        judgment.setCaseId(caseId);
        judgment.setSummary(request.getSummary());
        judgment.setOutcome(JudgmentOutcome.valueOf(request.getOutcome()));
        judgment.setJudgmentDate(request.getJudgmentDate());
        judgment.setRecordedBy(101L);
        judgment.setRecordedOn(LocalDateTime.now());
        return judgment;
    }
    
    public static JudgmentResponse toResponse(Judgment entity) {
        JudgmentResponse response = new JudgmentResponse();
        response.setJudgmentId(entity.getJudgmentId());
        response.setCaseId(entity.getCaseId());
        response.setSummary(entity.getSummary());
        response.setOutcome(entity.getOutcome().toString());
        response.setJudgmentDate(entity.getJudgmentDate());
        return response;
    }
}

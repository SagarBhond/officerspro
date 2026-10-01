package com.configserver.officerspro.courtcasemanagementservice.service;

import java.util.List;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.JudgmentRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.JudgmentResponse;

public interface JudgmentService {
    // Hearing-scoped methods (new)
    JudgmentResponse recordJudgment(Long caseId, Long hearingId, JudgmentRequest req);
    List<JudgmentResponse> getJudgmentsByHearing(Long caseId, Long hearingId);
    JudgmentResponse getJudgment(Long caseId, Long hearingId, Long judgmentId);
    
    // Update judgment
    JudgmentResponse updateJudgment(Long caseId, Long hearingId, Long judgmentId, JudgmentRequest req);
    
    // Case-scoped methods (for backward compatibility)
    JudgmentResponse recordJudgment(Long caseId, JudgmentRequest req);
    JudgmentResponse getJudgment(Long caseId);
}

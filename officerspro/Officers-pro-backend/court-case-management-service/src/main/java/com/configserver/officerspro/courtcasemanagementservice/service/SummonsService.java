package com.configserver.officerspro.courtcasemanagementservice.service;

import java.util.List;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.SummonsRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.StatusUpdateRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.SummonsResponse;

public interface SummonsService {
    // Hearing-scoped methods (new)
    SummonsResponse issueSummons(Long caseId, Long hearingId, SummonsRequest req);
    List<SummonsResponse> getSummonsByHearing(Long caseId, Long hearingId);
    SummonsResponse getSummons(Long caseId, Long hearingId, Long summonsId);
    SummonsResponse updateSummons(Long caseId, Long hearingId, Long summonsId, SummonsRequest req);
    void deleteSummons(Long caseId, Long hearingId, Long summonsId);
    SummonsResponse updateSummonsStatus(Long caseId, Long hearingId, Long summonsId, StatusUpdateRequest req);
    
    // Case-scoped methods (for backward compatibility)
    SummonsResponse issueSummons(Long caseId, SummonsRequest req);
    List<SummonsResponse> getSummons(Long caseId);
    SummonsResponse updateSummons(Long caseId, Long summonsId, SummonsRequest req);
}

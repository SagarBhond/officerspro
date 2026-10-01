package com.configserver.officerspro.courtcasemanagementservice.service;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.CourtCaseRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.CourtCaseResponse;
import com.configserver.officerspro.courtcasemanagementservice.enums.CaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CourtCaseService {
    CourtCaseResponse registerCourtCase(CourtCaseRequest req);
    CourtCaseResponse getCourtCase(Long caseId);
    CourtCaseResponse updateCourtCase(Long caseId, CourtCaseRequest req);
    void deleteCourtCase(Long caseId); // soft delete semantics handled inside
    
    // New methods for listing and searching
    Page<CourtCaseResponse> getCourtCases(CaseStatus status, String caseNumber, Pageable pageable);
    List<CourtCaseResponse> searchByCaseNumber(String caseNumber);
    
    // Update current chargesheet for a case
    CourtCaseResponse updateCurrentChargesheet(Long caseId, String chargesheetId);
    
    // Sync methods for court tracking and hearings
    void syncCourtTracking(Long caseId);
    void syncHearings(Long caseId);
    void syncJudgments(Long caseId);
}

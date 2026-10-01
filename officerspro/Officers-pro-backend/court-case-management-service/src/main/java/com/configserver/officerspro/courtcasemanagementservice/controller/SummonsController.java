package com.configserver.officerspro.courtcasemanagementservice.controller;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.SummonsRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.StatusUpdateRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.SummonsResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingParticipantResponse;
import com.configserver.officerspro.courtcasemanagementservice.service.SummonsService;
import com.configserver.officerspro.courtcasemanagementservice.service.HearingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/summon")
public class SummonsController {

    private final SummonsService summonsService;
    private final HearingService hearingService;

    public SummonsController(SummonsService summonsService, HearingService hearingService) {
        this.summonsService = summonsService;
        this.hearingService = hearingService;
    }

    // Get participants for a hearing (to help with summons issuance)
    @GetMapping("/courtcases/{caseId}/hearings/{hearingId}/participants")
    public ResponseEntity<List<HearingParticipantResponse>> getHearingParticipantsForSummons(@PathVariable Long caseId,
                                                                                             @PathVariable Long hearingId) {
        return ResponseEntity.ok(hearingService.getHearingParticipants(caseId, hearingId));
    }

    // Hearing-scoped endpoints (new)
    @PostMapping("/courtcases/{caseId}/hearings/{hearingId}/summons")
    public ResponseEntity<SummonsResponse> issueSummonsForHearing(@PathVariable Long caseId,
                                                                  @PathVariable Long hearingId,
                                                                  @RequestBody SummonsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(summonsService.issueSummons(caseId, hearingId, request));
    }

    @GetMapping("/courtcases/{caseId}/hearings/{hearingId}/summons")
    public ResponseEntity<List<SummonsResponse>> getSummonsByHearing(@PathVariable Long caseId,
                                                                     @PathVariable Long hearingId) {
        return ResponseEntity.ok(summonsService.getSummonsByHearing(caseId, hearingId));
    }

    @GetMapping("/courtcases/{caseId}/hearings/{hearingId}/summons/{summonsId}")
    public ResponseEntity<SummonsResponse> getSummonsForHearing(@PathVariable Long caseId,
                                                                @PathVariable Long hearingId,
                                                                @PathVariable Long summonsId) {
        return ResponseEntity.ok(summonsService.getSummons(caseId, hearingId, summonsId));
    }

    @PutMapping("/courtcases/{caseId}/hearings/{hearingId}/summons/{summonsId}")
    public ResponseEntity<SummonsResponse> updateSummonsForHearing(@PathVariable Long caseId,
                                                                   @PathVariable Long hearingId,
                                                                   @PathVariable Long summonsId,
                                                                   @RequestBody SummonsRequest request) {
        return ResponseEntity.ok(summonsService.updateSummons(caseId, hearingId, summonsId, request));
    }

    @DeleteMapping("/courtcases/{caseId}/hearings/{hearingId}/summons/{summonsId}")
    public ResponseEntity<Void> deleteSummonsForHearing(@PathVariable Long caseId,
                                                        @PathVariable Long hearingId,
                                                        @PathVariable Long summonsId) {
        summonsService.deleteSummons(caseId, hearingId, summonsId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/courtcases/{caseId}/hearings/{hearingId}/summons/{summonsId}/status")
    public ResponseEntity<SummonsResponse> updateSummonsStatusForHearing(@PathVariable Long caseId,
                                                                         @PathVariable Long hearingId,
                                                                         @PathVariable Long summonsId,
                                                                         @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(summonsService.updateSummonsStatus(caseId, hearingId, summonsId, request));
    }

    // Case-scoped endpoints (for backward compatibility)
    @PostMapping("/courtcases/{caseId}/summons")
    public ResponseEntity<SummonsResponse> issueSummons(@PathVariable Long caseId,
                                                        @RequestBody SummonsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(summonsService.issueSummons(caseId, request));
    }

    @GetMapping("/courtcases/{caseId}/summons")
    public ResponseEntity<List<SummonsResponse>> getSummons(@PathVariable Long caseId) {
        return ResponseEntity.ok(summonsService.getSummons(caseId));
    }

    @PutMapping("/courtcases/{caseId}/summons/{summonsId}")
    public ResponseEntity<SummonsResponse> updateSummons(@PathVariable Long caseId,
                                                         @PathVariable Long summonsId,
                                                         @RequestBody SummonsRequest request) {
        return ResponseEntity.ok(summonsService.updateSummons(caseId, summonsId, request));
    }
}

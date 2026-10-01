package com.configserver.officerspro.courtcasemanagementservice.controller;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.HearingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.HearingParticipantRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.StatusUpdateRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.HearingParticipantResponse;
import com.configserver.officerspro.courtcasemanagementservice.service.HearingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courtcases/{caseId}/hearings")
public class HearingController {

    private final HearingService hearingService;

    public HearingController(HearingService hearingService) {
        this.hearingService = hearingService;
    }

    @PostMapping
    public ResponseEntity<HearingResponse> scheduleHearing(@PathVariable Long caseId,
                                                           @RequestBody HearingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hearingService.scheduleHearing(caseId, request));
    }

    @GetMapping
    public ResponseEntity<List<HearingResponse>> getHearings(@PathVariable Long caseId,
                                                             @RequestParam(required = false) String status) {
        return ResponseEntity.ok(hearingService.getHearingsByCase(caseId, status));
    }

    @GetMapping("/{hearingId}")
    public ResponseEntity<HearingResponse> getHearing(@PathVariable Long caseId, @PathVariable Long hearingId) {
        return ResponseEntity.ok(hearingService.getHearing(caseId, hearingId));
    }

    @PutMapping("/{hearingId}")
    public ResponseEntity<HearingResponse> updateHearing(@PathVariable Long caseId,
                                                         @PathVariable Long hearingId,
                                                         @RequestBody HearingRequest request) {
        return ResponseEntity.ok(hearingService.updateHearing(caseId, hearingId, request));
    }

    @DeleteMapping("/{hearingId}")
    public ResponseEntity<Void> deleteHearing(@PathVariable Long caseId, @PathVariable Long hearingId) {
        hearingService.deleteHearing(caseId, hearingId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{hearingId}/status")
    public ResponseEntity<HearingResponse> updateHearingStatus(@PathVariable Long caseId,
                                                               @PathVariable Long hearingId,
                                                               @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(hearingService.updateHearingStatus(caseId, hearingId, request));
    }

    // Participant management endpoints
    @GetMapping("/{hearingId}/participants")
    public ResponseEntity<List<HearingParticipantResponse>> getHearingParticipants(@PathVariable Long caseId,
                                                                                   @PathVariable Long hearingId) {
        return ResponseEntity.ok(hearingService.getHearingParticipants(caseId, hearingId));
    }

    @PostMapping("/{hearingId}/participants")
    public ResponseEntity<HearingParticipantResponse> addHearingParticipant(@PathVariable Long caseId,
                                                                            @PathVariable Long hearingId,
                                                                            @RequestBody HearingParticipantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hearingService.addHearingParticipant(caseId, hearingId, request));
    }

    @DeleteMapping("/{hearingId}/participants/{participantId}")
    public ResponseEntity<Void> deleteHearingParticipant(@PathVariable Long caseId,
                                                        @PathVariable Long hearingId,
                                                        @PathVariable Long participantId) {
        hearingService.deleteHearingParticipant(caseId, hearingId, participantId);
        return ResponseEntity.noContent().build();
    }
}

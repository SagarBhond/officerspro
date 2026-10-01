package com.configserver.officerspro.courtcasemanagementservice.controller;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.JudgmentRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.JudgmentResponse;
import com.configserver.officerspro.courtcasemanagementservice.service.JudgmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/judgement")
public class JudgmentController {

    private final JudgmentService judgmentService;

    public JudgmentController(JudgmentService judgmentService) {
        this.judgmentService = judgmentService;
    }

    // Hearing-scoped endpoints (new)
    @PostMapping("/courtcases/{caseId}/hearings/{hearingId}/judgments")
    public ResponseEntity<JudgmentResponse> recordJudgmentForHearing(@PathVariable Long caseId,
                                                                     @PathVariable Long hearingId,
                                                                     @RequestBody JudgmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(judgmentService.recordJudgment(caseId, hearingId, request));
    }

    @GetMapping("/courtcases/{caseId}/hearings/{hearingId}/judgments")
    public ResponseEntity<List<JudgmentResponse>> getJudgmentsByHearing(@PathVariable Long caseId,
                                                                        @PathVariable Long hearingId) {
        return ResponseEntity.ok(judgmentService.getJudgmentsByHearing(caseId, hearingId));
    }

    @GetMapping("/courtcases/{caseId}/hearings/{hearingId}/judgments/{judgmentId}")
    public ResponseEntity<JudgmentResponse> getJudgmentForHearing(@PathVariable Long caseId,
                                                                 @PathVariable Long hearingId,
                                                                 @PathVariable Long judgmentId) {
        return ResponseEntity.ok(judgmentService.getJudgment(caseId, hearingId, judgmentId));
    }

    @PutMapping("/courtcases/{caseId}/hearings/{hearingId}/judgments/{judgmentId}")
    public ResponseEntity<JudgmentResponse> updateJudgmentForHearing(@PathVariable Long caseId,
                                                                     @PathVariable Long hearingId,
                                                                     @PathVariable Long judgmentId,
                                                                     @RequestBody JudgmentRequest request) {
        return ResponseEntity.ok(judgmentService.updateJudgment(caseId, hearingId, judgmentId, request));
    }

    // Case-scoped endpoints (for backward compatibility)
    @PostMapping("/courtcases/{caseId}/judgments")
    public ResponseEntity<JudgmentResponse> recordJudgment(@PathVariable Long caseId,
                                                          @RequestBody JudgmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(judgmentService.recordJudgment(caseId, request));
    }

    @GetMapping("/courtcases/{caseId}/judgments")
    public ResponseEntity<JudgmentResponse> getJudgment(@PathVariable Long caseId) {
        return ResponseEntity.ok(judgmentService.getJudgment(caseId));
    }
}

package com.configserver.officerspro.courtcasemanagementservice.controller;

import com.configserver.officerspro.courtcasemanagementservice.service.MockCourtDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mock-court-api")
public class MockCourtApiController {

    private final MockCourtDataService mockCourtDataService;

    public MockCourtApiController(MockCourtDataService mockCourtDataService) {
        this.mockCourtDataService = mockCourtDataService;
    }

    /**
     * Get court tracking details by FIR ID
     * Simulates external court API call
     */
    @GetMapping("/tracking")
    public ResponseEntity<Map<String, Object>> getCourtTracking(@RequestParam String firId) {
        Map<String, Object> tracking = mockCourtDataService.getTrackingByFirId(firId);
        if (tracking == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tracking);
    }

    /**
     * Get hearings by court tracking ID
     * Simulates external court API call
     */
    @GetMapping("/hearings")
    public ResponseEntity<List<Map<String, Object>>> getHearings(@RequestParam String courtTrackingId) {
        List<Map<String, Object>> hearings = mockCourtDataService.getHearingsByTrackingId(courtTrackingId);
        return ResponseEntity.ok(hearings);
    }

    /**
     * Get judgments by court tracking ID
     * Simulates external court API call
     */
    @GetMapping("/judgments")
    public ResponseEntity<List<Map<String, Object>>> getJudgments(@RequestParam String courtTrackingId) {
        List<Map<String, Object>> judgments = mockCourtDataService.getJudgmentsByTrackingId(courtTrackingId);
        return ResponseEntity.ok(judgments);
    }
}

package com.adminbackend.controller;

import com.adminbackend.dto.PlanDto;
import com.adminbackend.service.DashboardService;
import com.adminbackend.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/plans")
@RequiredArgsConstructor
public class PlanController {
    private final PlanService planService;
    private final DashboardService dashboardService;


    @GetMapping
    public ResponseEntity<List<PlanDto>> getAllPlans() {
        System.out.println("=== GET /api/admin/plans called ===");
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @PostMapping
    public ResponseEntity<PlanDto> createPlan(@RequestBody PlanDto planDto) {
        System.out.println("=== POST /api/admin/plans called ===");
        System.out.println("Plan data: " + planDto);
        return ResponseEntity.ok(planService.createPlan(planDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanDto> updatePlan(@PathVariable("id") Long id, @RequestBody PlanDto planDto) {
        System.out.println("=== PUT /api/admin/plans/" + id + " called ===");
        System.out.println("Plan data: " + planDto);
        return ResponseEntity.ok(planService.updatePlan(id, planDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable("id") Long id) {
        System.out.println("=== DELETE /api/admin/plans/" + id + " called ===");
        planService.deletePlan(id);
        System.out.println("Plan " + id + " deleted successfully");
        return ResponseEntity.ok().build();
    }

    // PlanController.java
    @GetMapping("/count/active")
    public ResponseEntity<Long> getActivePlans(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(dashboardService.getActivePlans(authHeader));
    }

    @GetMapping("/count/inactive")
    public ResponseEntity<Long> getInactivePlans(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(dashboardService.getInactivePlans(authHeader));
    }

    @GetMapping("/revenue/total")
    public ResponseEntity<Double> getTotalRevenue(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(dashboardService.getTotalRevenue(authHeader));
    }

    @GetMapping("/revenue/expected")
    public ResponseEntity<Double> getExpectedRevenue(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(dashboardService.getExpectedRevenue(authHeader));
    }


} 
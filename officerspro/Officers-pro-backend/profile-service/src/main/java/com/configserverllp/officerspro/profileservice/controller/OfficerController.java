package com.configserverllp.officerspro.profileservice.controller;

import com.configserverllp.officerspro.profileservice.dto.request.CreateOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.request.PatchOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.request.UpdateOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.request.UpdateSubscriptionRequest;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerListResponse;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerResponse;
import com.configserverllp.officerspro.profileservice.service.OfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/officers")
@RequiredArgsConstructor
@Slf4j
public class OfficerController {

    private final OfficerService officerService;

    /**
     * Create a new officer
     * POST /officers
     */
    @PostMapping
    public ResponseEntity<OfficerResponse> createOfficer(@Valid @RequestBody CreateOfficerRequest request) {
        log.info("POST /officers - Creating new officer");
        OfficerResponse response = officerService.createOfficer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get officer by ID
     * GET /officers/{officerId}
     */
    @GetMapping("/{officerId}")
    public ResponseEntity<OfficerResponse> getOfficerById(@PathVariable String officerId) {
        log.info("GET /officers/{} - Fetching officer", officerId);
        OfficerResponse response = officerService.getOfficerById(officerId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get officer by email
     * GET /officers/email/{officerEmail}
     */
    @GetMapping("/email/{officerEmail}")
    public ResponseEntity<OfficerResponse> getOfficerByEmail(@PathVariable String officerEmail) {
        log.info("GET /officers/email/{} - Fetching officer by email", officerEmail);
        OfficerResponse response = officerService.getOfficerByEmail(officerEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all officers with pagination and filters
     * GET /officers?status=true&station=XYZ&post=Inspector&adminEmail=admin@example.com&page=0&size=10&sort=created_on,desc
     */
    @GetMapping
    public ResponseEntity<Page<OfficerListResponse>> getAllOfficers(
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String station,
            @RequestParam(required = false) String post,
            @RequestParam(required = false) String adminEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "created_on") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("GET /officers - Fetching officers with filters");
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<OfficerListResponse> response = officerService.getAllOfficers(
                status, station, post, adminEmail, pageable
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Update officer (full update)
     * PUT /officers/{officerId}
     */
    @PutMapping("/{officerId}")
    public ResponseEntity<OfficerResponse> updateOfficer(
            @PathVariable String officerId,
            @Valid @RequestBody UpdateOfficerRequest request) {
        
        log.info("PUT /officers/{} - Updating officer", officerId);
        OfficerResponse response = officerService.updateOfficer(officerId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Patch officer (partial update)
     * PATCH /officers/{officerId}
     */
    @PatchMapping("/{officerId}")
    public ResponseEntity<OfficerResponse> patchOfficer(
            @PathVariable String officerId,
            @RequestBody PatchOfficerRequest request) {
        
        log.info("PATCH /officers/{} - Patching officer", officerId);
        OfficerResponse response = officerService.patchOfficer(officerId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete officer (soft delete)
     * DELETE /officers/{officerId}
     */
    @DeleteMapping("/{officerId}")
    public ResponseEntity<Void> deleteOfficer(@PathVariable String officerId) {
        log.info("DELETE /officers/{} - Deleting officer", officerId);
        officerService.deleteOfficer(officerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search officers by name
     * GET /officers/search?name=John&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<Page<OfficerListResponse>> searchOfficersByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /officers/search?name={} - Searching officers", name);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<OfficerListResponse> response = officerService.searchOfficersByName(name, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Update officer subscription (called by Admin Backend during registration)
     * POST /officers/{officerId}/subscription
     */
    @PostMapping("/{officerId}/subscription")
    public ResponseEntity<OfficerResponse> updateSubscription(
            @PathVariable String officerId,
            @RequestBody UpdateSubscriptionRequest request) {
        
        log.info("POST /officers/{}/subscription - Updating subscription to {}", officerId, request.getSubscriptionType());
        OfficerResponse response = officerService.updateSubscription(officerId, request);
        return ResponseEntity.ok(response);
    }
}

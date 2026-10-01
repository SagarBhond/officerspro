package com.configserverllp.officerspro.profileservice.service;

import com.configserverllp.officerspro.profileservice.dto.request.CreateOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.request.PatchOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.request.UpdateOfficerRequest;
import com.configserverllp.officerspro.profileservice.dto.request.UpdateSubscriptionRequest;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerListResponse;
import com.configserverllp.officerspro.profileservice.dto.response.OfficerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OfficerService {

    /**
     * Create a new officer
     */
    OfficerResponse createOfficer(CreateOfficerRequest request);

    /**
     * Get officer by ID
     */
    OfficerResponse getOfficerById(String officerId);

    /**
     * Get officer by email
     */
    OfficerResponse getOfficerByEmail(String officerEmail);

    /**
     * Get all officers with pagination and filters
     */
    Page<OfficerListResponse> getAllOfficers(
            Boolean status,
            String station,
            String post,
            String adminEmail,
            Pageable pageable
    );

    /**
     * Update officer (full update)
     */
    OfficerResponse updateOfficer(String officerId, UpdateOfficerRequest request);

    /**
     * Patch officer (partial update)
     */
    OfficerResponse patchOfficer(String officerId, PatchOfficerRequest request);

    /**
     * Delete officer (soft delete)
     */
    void deleteOfficer(String officerId);

    /**
     * Search officers by name
     */
    Page<OfficerListResponse> searchOfficersByName(String name, Pageable pageable);

    /**
     * Update officer subscription
     */
    OfficerResponse updateSubscription(String officerId, UpdateSubscriptionRequest request);
}

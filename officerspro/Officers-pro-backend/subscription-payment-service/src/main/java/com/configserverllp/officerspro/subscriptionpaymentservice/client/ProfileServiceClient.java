package com.configserverllp.officerspro.subscriptionpaymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "profile-service", url = "${profile.service.url}")
public interface ProfileServiceClient {
    
    @PutMapping("/internal/officers/{officerId}/sync-subscription")
    void syncSubscription(
            @PathVariable("officerId") String officerId,
            @RequestBody Map<String, Object> syncRequest
    );
    
    /**
     * Get officer by email to retrieve the real officerId
     * Using the CMS endpoint that the frontend uses: /getSingleOfficer/{email}
     * This goes through the API Gateway to CMS service
     */
    @GetMapping("/api/profile/officers/email/{email}")
    Map<String, Object> getOfficerByEmail(@PathVariable("email") String email);
}

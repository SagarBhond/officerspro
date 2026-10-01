package com.configserverllp.officerspro.profileservice.controller;

import com.configserverllp.officerspro.profileservice.dto.SubscriptionSyncRequest;
import com.configserverllp.officerspro.profileservice.entity.Officer;
import com.configserverllp.officerspro.profileservice.repository.OfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoints for inter-service communication
 * NOT exposed through API Gateway (internal network only)
 */
@RestController
@RequestMapping("/internal/officers")
@RequiredArgsConstructor
public class InternalOfficerController {
    
    private final OfficerRepository officerRepository;
    
    /**
     * Sync subscription data from SubscriptionPaymentService
     * Called after successful payment
     */
    @PutMapping("/{officerId}/sync-subscription")
    public ResponseEntity<?> syncSubscription(
            @PathVariable String officerId,
            @RequestBody SubscriptionSyncRequest request) {
        
        System.out.println("🔄 Syncing subscription for officer: " + officerId);
        System.out.println("   Type: " + request.getSubscriptionType());
        System.out.println("   End Date: " + request.getEndDate());
        
        Officer officer = officerRepository.findById(officerId)
            .orElseThrow(() -> new RuntimeException("Officer not found: " + officerId));
        
        // Update subscription fields
        officer.setSubscriptionType(request.getSubscriptionType());
        officer.setSubscriptionStartDate(request.getStartDate());
        officer.setSubscriptionEndDate(request.getEndDate());
        officer.setRemainingDays(request.getRemainingDays());
        officer.setLastPaymentId(request.getPaymentId());
        officer.setLastPaymentDate(request.getPaymentDate());
        
        officerRepository.save(officer);
        
        System.out.println("✅ Subscription synced successfully");
        
        return ResponseEntity.ok().body("Subscription synced successfully");
    }
}

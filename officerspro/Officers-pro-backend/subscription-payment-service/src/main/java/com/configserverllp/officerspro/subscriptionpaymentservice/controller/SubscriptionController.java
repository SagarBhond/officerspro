package com.configserverllp.officerspro.subscriptionpaymentservice.controller;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.OfficerSubscription;
import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import com.configserverllp.officerspro.subscriptionpaymentservice.repository.OfficerSubscriptionRepository;
import com.configserverllp.officerspro.subscriptionpaymentservice.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
// CORS handled by API Gateway - no @CrossOrigin needed
public class SubscriptionController {

    private final OfficerSubscriptionRepository officerSubscriptionRepo;
    private final SubscriptionService subscriptionService;

    @GetMapping("/status")
    public ResponseEntity<?> getSubscriptionStatus(@RequestParam("email") String email) {
        try {
            OfficerSubscription subscription = officerSubscriptionRepo.findByOfficerEmail(email)
                    .orElse(null);

            if (subscription == null) {
                // Use HashMap because Map.of() doesn't allow null values
                Map<String, Object> response = new HashMap<>();
                response.put("currentPlan", "FREE");
                response.put("startDate", null);
                response.put("endDate", null);
                response.put("remainingDays", 0);
                response.put("isValid", false);
                response.put("hasUpcomingPlan", false);
                return ResponseEntity.ok(response);
            }

            // Update remaining days to ensure accuracy
            subscription.updateRemainingDays();

            Map<String, Object> response = new HashMap<>();
            response.put("currentPlan", subscription.getSubscriptionType());
            response.put("startDate", subscription.getSubscriptionStartDate());
            response.put("endDate", subscription.getSubscriptionEndDate());
            response.put("remainingDays", subscription.getRemainingDays() != null ? subscription.getRemainingDays() : 0);
            response.put("isValid", subscriptionService.isSubscriptionValid(email));
            
            // Add upcoming plan information - null-safe
            try {
                response.put("hasUpcomingPlan", subscription.getUpcomingPlanType() != null);
                if (subscription.getUpcomingPlanType() != null) {
                    response.put("upcomingPlan", subscription.getUpcomingPlanType());
                    response.put("upcomingPlanActivationDate", subscription.getUpcomingPlanActivationDate());
                }
            } catch (Exception e) {
                // If upcoming plan fields don't exist in DB yet, just set to false
                System.out.println("⚠️ Upcoming plan fields not available (old schema?): " + e.getMessage());
                response.put("hasUpcomingPlan", false);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to get subscription status: " + e.getMessage());
        }
    }

    @GetMapping("/status/all")
    public ResponseEntity<?> getAllOfficersSubscriptionStatus() {
        try {
            List<OfficerSubscription> subscriptions = officerSubscriptionRepo.findAll();

            if (subscriptions.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No officer subscriptions found in the system");
            }

            List<Map<String, Object>> subscriptionDetails = subscriptions.stream().map(subscription -> {
                Map<String, Object> map = new HashMap<>();
                
                subscription.updateRemainingDays();
                
                map.put("officerId", subscription.getOfficerId());
                map.put("officerEmail", subscription.getOfficerEmail());
                map.put("currentPlan", subscription.getSubscriptionType() != null ? subscription.getSubscriptionType() : "N/A");
                map.put("startDate", subscription.getSubscriptionStartDate());
                map.put("endDate", subscription.getSubscriptionEndDate());
                map.put("remainingDays", subscription.getRemainingDays() != null ? subscription.getRemainingDays() : 0);
                map.put("adminEmail",subscription.getAdminEmail() != null ? subscription.getAdminEmail() : "N/A");
                
                // Add upcoming plan info
                map.put("hasUpcomingPlan", subscription.getUpcomingPlanType() != null);
                if (subscription.getUpcomingPlanType() != null) {
                    map.put("upcomingPlan", subscription.getUpcomingPlanType());
                    map.put("upcomingPlanActivationDate", subscription.getUpcomingPlanActivationDate());
                }

                try {
                    boolean isValid = subscriptionService.isSubscriptionValid(subscription.getOfficerEmail());
                    map.put("isValid", isValid);
                } catch (Exception e) {
                    map.put("isValid", false);
                }

                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(subscriptionDetails);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to fetch subscription status: " + e.getMessage());
        }
    }

    @GetMapping("/plans")
    public ResponseEntity<?> getAvailablePlans() {
        return ResponseEntity.ok(SubscriptionType.values());
    }

    @PostMapping("/change")
    public ResponseEntity<?> changeSubscription(
            @RequestParam String email,
            @RequestParam SubscriptionType newPlan) {
        OfficerSubscription subscription = officerSubscriptionRepo.findByOfficerEmail(email)
                .orElseThrow(() -> new RuntimeException("Officer subscription not found"));

        // For free plan, update directly
        if (newPlan == SubscriptionType.FREE) {
            subscription.updateSubscription(newPlan, null);
            officerSubscriptionRepo.save(subscription);
            return ResponseEntity.ok("Subscription changed to FREE plan");
        }

        return ResponseEntity.ok(Map.of(
                "message", "Please make payment to upgrade",
                "requiredAction", "create_payment_order"
        ));
    }

    @GetMapping("/validate/{email}")
    public ResponseEntity<?> validateSubscription(@PathVariable String email) {
        boolean isValid = subscriptionService.isSubscriptionValid(email);
        return ResponseEntity.ok(Map.of("isValid", isValid));
    }
}

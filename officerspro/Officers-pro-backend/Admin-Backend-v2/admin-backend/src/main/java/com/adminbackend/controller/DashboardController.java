package com.adminbackend.controller;

import com.adminbackend.dto.UserDto;
import com.adminbackend.entity.CustomUserDetails;
import com.adminbackend.entity.User;
import com.adminbackend.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/admin")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);
    @Autowired(required = true)
    private DashboardService dashboardService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${cms-services-url}")
    private String cmsServiceUrl;

    @GetMapping("/getTotalAllStatements")
    public ResponseEntity<Map<String, Long>> getTotalCaseCount() {
        long totalCount = dashboardService.getTotalAllStatements();
        return ResponseEntity.ok(Map.of("total", totalCount));
    }

    // Direct case endpoints
    @GetMapping("/cases/total")
    public ResponseEntity<Long> getTotalCases() {
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Long> response = restTemplate.exchange(
                    cmsServiceUrl + "/api/admin/cases/total",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching total cases: ", e);
            return ResponseEntity.ok(0L);
        }
    }

    @GetMapping("/cases/active")
    public ResponseEntity<Long> getActiveCases() {
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Long> response = restTemplate.exchange(
                    cmsServiceUrl + "/api/admin/cases/active",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching active cases: ", e);
            return ResponseEntity.ok(0L);
        }
    }

    @GetMapping("/cases/completed")
    public ResponseEntity<Long> getCompletedCases() {
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Long> response = restTemplate.exchange(
                    cmsServiceUrl + "/api/admin/cases/completed",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching completed cases: ", e);
            return ResponseEntity.ok(0L);
        }
    }

    @GetMapping("/cases/statements")
    public ResponseEntity<Long> getTotalStatements() {
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Long> response = restTemplate.exchange(
                    cmsServiceUrl + "/api/admin/cases/statements",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching total statements: ", e);
            return ResponseEntity.ok(0L);
        }
    }

    @GetMapping("/victim/total-officers")
    public ResponseEntity<Long> getTotalOfficers() {
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Long> response = restTemplate.exchange(
                    cmsServiceUrl + "/api/victim/total-officers",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching total officers: ", e);
            return ResponseEntity.ok(0L);
        }
    }

    @GetMapping("/subscriptions/public/status/getAllSubscription/{email}")
    public ResponseEntity<?> getSubscriptionByEmail(@PathVariable("email") String email) {
        try {
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<List> response = restTemplate.exchange(
                    cmsServiceUrl + "/api/subscriptions/public/status/getAllSubscription/" + email,
                    HttpMethod.GET,
                    entity,
                    List.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching subscription data: ", e);
            return ResponseEntity.ok(List.of());
        }
    }

    // Summary endpoint that returns both user and officer counts
    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, Long>> getSummary(@RequestHeader("Authorization") String authHeader) {
        // Prepare the summary map
        Map<String, Long> summary = new HashMap<>();

        // Call the service methods and pass the authHeader
        summary.put("totalUsers", dashboardService.getTotalUsers());  // Calls service to get total users
        summary.put("totalOfficers", dashboardService.getTotalOfficers(authHeader));  // Calls service to get total officers

        // Return the summary response
        return ResponseEntity.ok(summary);
    }


    // Optional: If you still want a separate endpoint for just users
    @GetMapping("/total-users")
    public ResponseEntity<Long> getTotalUsers() {
        return ResponseEntity.ok(dashboardService.getTotalUsers());  // Use service method for total users
    }


     @GetMapping("/status/getAllOfficer-SubscriptionDetails")
     public ResponseEntity<?> getSubscriptionStatus(HttpServletRequest request) {
         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
         Object principal = authentication.getPrincipal();
         String adminEmail;

         if (principal instanceof CustomUserDetails customUserDetails) {
             User user = customUserDetails.getUser(); // Assuming this getter exists
             adminEmail = user.getEmail();
         } else if (principal instanceof String) {
             adminEmail = (String) principal;
         } else {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication principal");
         }

         try {
             // Use the new public endpoint to avoid authentication issues
             String cmsUrl = cmsServiceUrl + "/api/subscriptions/public/status/getAllSubscription/" + adminEmail;
             // No authentication headers needed for backend-to-backend call
             HttpHeaders headers = new HttpHeaders();
             HttpEntity<Void> entity = new HttpEntity<>(headers);

             System.out.println("Calling CMS: " + cmsUrl);
             ResponseEntity<List> response = restTemplate.exchange(
                     cmsUrl,
                     HttpMethod.GET,
                     entity,
                     List.class
             );
             return ResponseEntity.ok(response.getBody());
         } catch (Exception e) {
             log.error("Error fetching subscription status: ", e);
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                     .body("Failed to fetch subscription status: " + e.getMessage());
         }
     }
    @PreAuthorize("hasAuthority('User Subscription Data:READ')")
    @GetMapping("/status/getAllOfficer-SubscriptionDetails/{email}")
    public ResponseEntity<?> getSubscriptionStatus(@PathVariable("email") String email) {
        try {
            String cmsUrl = cmsServiceUrl + "/status/getAllSubscription/" + email;

            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            System.out.println("Calling CMS: " + cmsUrl);
            ResponseEntity<List> response = restTemplate.exchange(
                    cmsUrl,
                    HttpMethod.GET,
                    entity,
                    List.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch subscription status: " + e.getMessage());
        }
    }

    @GetMapping("/total-managers")
    public ResponseEntity<Long> getTotalManagers() {
        return ResponseEntity.ok(dashboardService.getTotalManagers());
    }

//    @GetMapping("/plan/active-count")
//    public ResponseEntity<Long> getActivePlans() {
//        return ResponseEntity.ok(dashboardService.getActivePlans());
//    }
//
//    @GetMapping("/plan/inactive-count")
//    public ResponseEntity<Long> getInactivePlans() {
//        return ResponseEntity.ok(dashboardService.getInactivePlans());
//    }


    @GetMapping("/payment-history/all")
    public ResponseEntity<?> getAllPaymentHistory() {
        try {
            String cmsUrl = cmsServiceUrl + "/api/payment-history/public/admin/all";

            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            System.out.println("Calling CMS for payment history: " + cmsUrl);
            ResponseEntity<List> response = restTemplate.exchange(
                    cmsUrl,
                    HttpMethod.GET,
                    entity,
                    List.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            System.err.println("Error fetching payment history: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch payment history: " + e.getMessage());
        }
    }
    @GetMapping("/help-and-support/count")
    public ResponseEntity<Long> getHelpAndSupportCount() {
        try {
            Long count = dashboardService.getHelpAndSupportCount(); // ✅ Use DashboardService now
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error while getting Help & Support count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
        }
    }

}
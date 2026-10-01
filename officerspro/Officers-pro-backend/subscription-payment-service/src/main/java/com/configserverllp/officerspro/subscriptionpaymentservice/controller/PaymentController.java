package com.configserverllp.officerspro.subscriptionpaymentservice.controller;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import com.configserverllp.officerspro.subscriptionpaymentservice.service.RazorpayService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
// CORS handled by API Gateway - no @CrossOrigin needed
public class PaymentController {

    private final RazorpayService razorpayService;

    @PostMapping("/create-subscription-order")
    public ResponseEntity<?> createSubscriptionOrder(
            @RequestParam(name = "email") String email,
            @RequestParam(name = "planType") SubscriptionType planType,
            @RequestParam(name = "officerName", required = false) String officerName) throws RazorpayException {
        
        // Use provided officerName or fallback to email prefix
        if (officerName == null || officerName.trim().isEmpty()) {
            officerName = email.split("@")[0];
        }
        
        return ResponseEntity.ok(razorpayService.createSubscriptionOrder(email, planType, officerName));
    }

    @PostMapping("/verify-subscription")
    public ResponseEntity<?> verifySubscriptionPayment(@RequestBody Map<String, String> payload) {
        try {
            String orderId = payload.get("razorpay_order_id");
            String paymentId = payload.get("razorpay_payment_id");
            String signature = payload.get("razorpay_signature");
            
            if (orderId == null || paymentId == null || signature == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("status", "failure");
                errorResponse.put("message", "Missing required payment parameters");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            System.out.println("🔍 Verifying payment - OrderId: " + orderId + ", PaymentId: " + paymentId);
            
            boolean isValid = razorpayService.verifyAndUpdateSubscription(orderId, paymentId, signature);
            
            if (isValid) {
                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Payment verified and subscription updated");
                System.out.println("✅ Payment verification successful for order: " + orderId);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("status", "failure");
                response.put("message", "Payment signature verification failed");
                System.err.println("❌ Payment verification failed for order: " + orderId);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            System.err.println("❌ Error during payment verification: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "failure");
            errorResponse.put("message", "Payment verification error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

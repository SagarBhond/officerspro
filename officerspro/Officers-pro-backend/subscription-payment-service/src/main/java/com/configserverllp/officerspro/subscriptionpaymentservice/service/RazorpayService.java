package com.configserverllp.officerspro.subscriptionpaymentservice.service;

import com.configserverllp.officerspro.subscriptionpaymentservice.client.AdminServiceClient;
import com.configserverllp.officerspro.subscriptionpaymentservice.client.ProfileServiceClient;
import com.configserverllp.officerspro.subscriptionpaymentservice.dto.PlanDto;
import com.configserverllp.officerspro.subscriptionpaymentservice.entity.OfficerSubscription;
import com.configserverllp.officerspro.subscriptionpaymentservice.entity.PaymentTransaction;
import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import com.configserverllp.officerspro.subscriptionpaymentservice.repository.OfficerSubscriptionRepository;
import com.configserverllp.officerspro.subscriptionpaymentservice.repository.PaymentTransactionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.binary.Hex;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final PaymentTransactionRepository paymentRepo;
    private final OfficerSubscriptionRepository officerSubscriptionRepo;
    private final EmailService emailService;
    private final AdminServiceClient adminServiceClient;
    private final ProfileServiceClient profileServiceClient;

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    // Create order for subscription payment
    @Transactional
    public Map<String, Object> createSubscriptionOrder(String email, SubscriptionType planType, String officerName) throws RazorpayException {
        try {
            System.out.println("📝 Creating subscription order for email: " + email + ", plan: " + planType);
            
            // Get real officerId from ProfileService or existing subscription
            String officerId = null;
            
            // First, try to get from existing subscription
            OfficerSubscription existingSubscription = officerSubscriptionRepo.findByOfficerEmail(email).orElse(null);
            if (existingSubscription != null) {
                officerId = existingSubscription.getOfficerId();
                System.out.println("✅ Found officerId from existing subscription: " + officerId);
            }
            
            // If not found, try to get from ProfileService
            if (officerId == null || officerId.trim().isEmpty() || officerId.startsWith("officer_")) {
                try {
                    Map<String, Object> officerData = profileServiceClient.getOfficerByEmail(email);
                    if (officerData != null && officerData.containsKey("officerId")) {
                        officerId = (String) officerData.get("officerId");
                        System.out.println("✅ Retrieved real officerId from ProfileService: " + officerId);
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Could not fetch officerId from ProfileService: " + e.getMessage());
                    // Will be set during payment verification
                }
            }

            double amount = getPlanAmount(planType);
            System.out.println("💰 Plan amount: " + amount);
            
            String receipt = "sub_" + System.currentTimeMillis();

            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", (int) (amount * 100)); // in paise
            options.put("currency", "INR");
            options.put("receipt", receipt);
            options.put("payment_capture", 1);
            options.put("notes", new JSONObject()
                    .put("email", email)
                    .put("plan_type", planType.name()));

            Order order = client.orders.create(options);
            System.out.println("✅ Razorpay order created: " + order.get("id"));

            // Save transaction
            PaymentTransaction txn = new PaymentTransaction();
            txn.setOfficerId(officerId);  // May be null if subscription doesn't exist yet
            txn.setOfficerName(officerName);
            txn.setOfficerEmail(email);
            txn.setRazorpayOrderId(order.get("id"));
            txn.setAmount(amount);
            txn.setCurrency("INR");
            txn.setReceipt(receipt);
            txn.setStatus("CREATED");
            txn.setCreatedAt(LocalDateTime.now());
            txn.setPlanType(planType);
            paymentRepo.save(txn);
            
            System.out.println("✅ Payment transaction saved");

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("receipt", order.get("receipt"));
            response.put("planType", planType);
            return response;
        } catch (RazorpayException e) {
            System.err.println("❌ Razorpay error: " + e.getMessage());
            throw e;  // Rethrow to be handled by controller
        } catch (Exception e) {
            System.err.println("❌ Error creating subscription order: " + e.getMessage());
            e.printStackTrace();
            throw new RazorpayException("Failed to create subscription order: " + e.getMessage());
        }
    }

    // Verify payment and update subscription
    @Transactional
    public boolean verifyAndUpdateSubscription(String orderId, String paymentId, String signature) {
        System.out.println("🔍 Starting payment verification for orderId: " + orderId);
        
        PaymentTransaction txn = paymentRepo.findByRazorpayOrderId(orderId);
        if (txn == null) {
            System.err.println("❌ Payment transaction not found for orderId: " + orderId);
            return false;
        }
        
        // ✅ Idempotency check - prevent duplicate processing
        if ("PAID".equals(txn.getStatus())) {
            System.out.println("⚠️ Payment already processed successfully for orderId: " + orderId);
            return true;  // Already successful, don't process again
        }
        
        System.out.println("✅ Transaction found - Email: " + txn.getOfficerEmail() + ", Status: " + txn.getStatus());

        boolean isValid = verifyPaymentSignature(orderId, paymentId, signature);
        System.out.println("🔐 Signature verification result: " + isValid);
        
        txn.setRazorpayPaymentId(paymentId);
        txn.setRazorpaySignature(signature);
        txn.setStatus(isValid ? "PAID" : "FAILED");
        txn.setUpdatedAt(LocalDateTime.now());
        paymentRepo.save(txn);

        if (isValid) {
            try {
                // Find or create subscription
                OfficerSubscription subscription = officerSubscriptionRepo.findByOfficerEmail(txn.getOfficerEmail())
                        .orElse(null);
                
                // If subscription doesn't exist, create a new one
                if (subscription == null) {
                    // Get real officerId from transaction or ProfileService
                    String officerId = txn.getOfficerId();
                    
                    // If officerId is null, empty, or is a generated one (starts with "officer_"), get real one from ProfileService
                    if (officerId == null || officerId.trim().isEmpty() || officerId.startsWith("officer_")) {
                        try {
                            Map<String, Object> officerData = profileServiceClient.getOfficerByEmail(txn.getOfficerEmail());
                            if (officerData != null && officerData.containsKey("officerId")) {
                                officerId = (String) officerData.get("officerId");
                                System.out.println("✅ Retrieved real officerId from ProfileService during verification: " + officerId);
                            } else {
                                System.err.println("⚠️ ProfileService did not return officerId for email: " + txn.getOfficerEmail());
                                // Fallback: use generated ID (shouldn't happen in production)
                                officerId = "officer_" + txn.getOfficerEmail().replace("@", "_").replace(".", "_");
                            }
                        } catch (Exception e) {
                            System.err.println("⚠️ Could not fetch officerId from ProfileService: " + e.getMessage());
                            // Fallback: use generated ID (shouldn't happen in production)
                            if (officerId == null || officerId.trim().isEmpty()) {
                                officerId = "officer_" + txn.getOfficerEmail().replace("@", "_").replace(".", "_");
                            }
                        }
                    }
                    
                    subscription = OfficerSubscription.builder()
                            .officerId(officerId)
                            .officerEmail(txn.getOfficerEmail())
                            .subscriptionType(SubscriptionType.FREE)
                            .isActive(true)
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    // Update officerId in transaction if it was null or was a generated one
                    if (txn.getOfficerId() == null || txn.getOfficerId().startsWith("officer_")) {
                        txn.setOfficerId(officerId);
                        paymentRepo.save(txn);
                        System.out.println("✅ Updated transaction with real officerId: " + officerId);
                    }
                }
                
                SubscriptionType planType = txn.getPlanType();
                subscription.updateSubscription(planType, paymentId);
                
                // ✅ Save subscription FIRST (critical operation)
                subscription = officerSubscriptionRepo.save(subscription);
                System.out.println("✅ Subscription updated and saved successfully");
                
                // Now send emails (non-critical - can fail without affecting payment)
                int days = switch (planType) {
                    case FREE -> 0;
                    case ONE_MONTH -> 30;
                    case THREE_MONTHS -> 90;
                    case SIX_MONTHS -> 180;
                    case TWELVE_MONTHS -> 365;
                };

                try {
                    // Use officerName from transaction, fallback to email prefix if not available
                    String officerName = txn.getOfficerName();
                    if (officerName == null || officerName.trim().isEmpty()) {
                        officerName = subscription.getOfficerEmail().split("@")[0];
                    }
                    
                    emailService.sendSubscriptionConfirmation(
                            subscription.getOfficerEmail(),
                            officerName,
                            planType.name(),
                            days
                    );
                    System.out.println("✅ Confirmation email sent successfully");
                } catch (Exception e) {
                    // Log error but don't fail payment verification
                    System.err.println("⚠️ Failed to send confirmation email (payment still successful): " + e.getMessage());
                }

                // Sync with ProfileService (non-critical)
                try {
                    syncWithProfileService(subscription);
                } catch (Exception e) {
                    System.err.println("⚠️ Profile sync failed (payment still successful): " + e.getMessage());
                }
                
            } catch (Exception e) {
                // ✅ Critical error - rollback transaction
                System.err.println("❌ CRITICAL: Failed to update subscription: " + e.getMessage());
                e.printStackTrace();
                txn.setStatus("FAILED");
                txn.setUpdatedAt(LocalDateTime.now());
                paymentRepo.save(txn);
                return false;  // Payment verification failed
            }
        }

        return isValid;
    }

    private double getPlanAmount(SubscriptionType planType) {
        try {
            System.out.println("💰 Fetching plan amount for: " + planType);
            // Fetch plans dynamically from Admin Backend with timeout handling
            List<PlanDto> plans = adminServiceClient.getAllPlans();
            
            double amount = plans.stream()
                    .filter(plan -> plan.getDuration() == planType && plan.isActive())
                    .findFirst()
                    .map(PlanDto::getPrice)
                    .orElseThrow(() -> new RuntimeException("Plan not found for type: " + planType));
            
            System.out.println("✅ Plan amount fetched: " + amount);
            return amount;
        } catch (Exception e) {
            // Fallback to hardcoded prices if Admin Backend is unavailable or times out
            System.err.println("⚠️ Could not fetch plans from Admin Backend (using fallback prices): " + e.getMessage());
            double fallbackAmount = switch (planType) {
                case ONE_MONTH -> 500.0;
                case THREE_MONTHS -> 1350.0;
                case SIX_MONTHS -> 2400.0;
                case TWELVE_MONTHS -> 4200.0;
                default -> 0.0;
            };
            System.out.println("✅ Using fallback amount: " + fallbackAmount);
            return fallbackAmount;
        }
    }

    // Payment signature verification
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            String actual = orderId + "|" + paymentId;
            String expected = hmacSHA256(actual, keySecret);
            boolean isValid = expected.equals(signature);
            
            if (!isValid) {
                System.err.println("❌ Signature mismatch!");
                System.err.println("   Expected: " + expected);
                System.err.println("   Received: " + signature);
                System.err.println("   Data: " + actual);
            } else {
                System.out.println("✅ Signature verified successfully");
            }
            
            return isValid;
        } catch (Exception e) {
            System.err.println("❌ Error during signature verification: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret = new SecretKeySpec(key.getBytes(), "HmacSHA256");
        mac.init(secret);
        byte[] digest = mac.doFinal(data.getBytes());
        return Hex.encodeHexString(digest);
    }

    // Sync subscription data with ProfileService using FeignClient
    private void syncWithProfileService(OfficerSubscription subscription) {
        try {
            Map<String, Object> syncRequest = new HashMap<>();
            syncRequest.put("subscriptionType", subscription.getSubscriptionType());
            syncRequest.put("startDate", subscription.getSubscriptionStartDate());
            syncRequest.put("endDate", subscription.getSubscriptionEndDate());
            syncRequest.put("remainingDays", subscription.getRemainingDays());
            syncRequest.put("paymentId", subscription.getLastPaymentId());
            syncRequest.put("paymentDate", subscription.getLastPaymentDate());
            
            profileServiceClient.syncSubscription(subscription.getOfficerId(), syncRequest);
            System.out.println("✅ Synced subscription with ProfileService for officer: " + subscription.getOfficerId());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to sync with ProfileService: " + e.getMessage());
            // Don't throw - payment already succeeded
        }
    }
}

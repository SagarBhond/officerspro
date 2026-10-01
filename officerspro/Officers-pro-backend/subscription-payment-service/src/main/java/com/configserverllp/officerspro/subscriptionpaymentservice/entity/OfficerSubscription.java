package com.configserverllp.officerspro.subscriptionpaymentservice.entity;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "officer_subscription")
public class OfficerSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "officer_id", unique = true, nullable = false)
    private String officerId;

    @Column(name = "officer_email", nullable = false)
    private String officerEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType;

    @Column(name = "subscription_start_date")
    private LocalDateTime subscriptionStartDate;

    @Column(name = "subscription_end_date")
    private LocalDateTime subscriptionEndDate;

    @Column(name = "remaining_days")
    private Long remainingDays;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_payment_id")
    private String lastPaymentId;

    @Column(name = "last_payment_date")
    private LocalDateTime lastPaymentDate;

    @Column(name = "admin_email")
    private String adminEmail;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Upcoming plan fields - to queue next plan when current is active
    @Enumerated(EnumType.STRING)
    @Column(name = "upcoming_plan_type", nullable = true)
    private SubscriptionType upcomingPlanType;

    @Column(name = "upcoming_plan_activation_date", nullable = true)
    private LocalDateTime upcomingPlanActivationDate;

    @Column(name = "upcoming_plan_payment_id", nullable = true)
    private String upcomingPlanPaymentId;

    // Calculate remaining days between now and subscriptionEndDate
    public void updateRemainingDays() {
        if (subscriptionEndDate != null) {
            this.remainingDays = ChronoUnit.DAYS.between(LocalDateTime.now(), subscriptionEndDate);
            if (this.remainingDays < 0) {
                this.remainingDays = 0L;
            }
        } else {
            this.remainingDays = null;
        }
    }

    // Returns true if current time is before subscriptionEndDate
    public boolean isSubscriptionValid() {
        return subscriptionEndDate != null && LocalDateTime.now().isBefore(subscriptionEndDate);
    }

    // Update subscription with new plan - smart queuing to prevent losing remaining days
    public void updateSubscription(SubscriptionType newPlan, String paymentId) {
        LocalDateTime now = LocalDateTime.now();
        
        // Check if current plan is still active and not FREE
        boolean hasActivePlan = subscriptionEndDate != null 
            && now.isBefore(subscriptionEndDate) 
            && subscriptionType != SubscriptionType.FREE
            && subscriptionType != null;
        
        if (hasActivePlan) {
            // Current plan is active - queue new plan to start after it expires
            this.upcomingPlanType = newPlan;
            this.upcomingPlanPaymentId = paymentId;
            this.upcomingPlanActivationDate = subscriptionEndDate;  // Starts when current ends
            this.updatedAt = now;
            System.out.println("✅ Queued upcoming plan: " + newPlan + " to activate on " + subscriptionEndDate);
        } else {
            // No active plan - activate immediately
            activatePlan(newPlan, paymentId, now);
        }
        
        updateRemainingDays();
    }
    
    // Activate a plan immediately
    private void activatePlan(SubscriptionType plan, String paymentId, LocalDateTime startDate) {
        this.subscriptionType = plan;
        this.subscriptionStartDate = startDate;

        switch (plan) {
            case ONE_MONTH:
                this.subscriptionEndDate = startDate.plusDays(30);
                break;
            case THREE_MONTHS:
                this.subscriptionEndDate = startDate.plusDays(90);
                break;
            case SIX_MONTHS:
                this.subscriptionEndDate = startDate.plusDays(180);
                break;
            case TWELVE_MONTHS:
                this.subscriptionEndDate = startDate.plusDays(365);
                break;
            case FREE:
                this.subscriptionEndDate = null;
                break;
        }

        if (paymentId != null) {
            this.lastPaymentId = paymentId;
            this.lastPaymentDate = startDate;
        }

        this.updatedAt = startDate;
        System.out.println("✅ Activated plan: " + plan + " from " + startDate + " to " + subscriptionEndDate);
    }
    
    // Activate upcoming plan (called manually or by scheduled job)
    public void activateUpcomingPlan() {
        if (upcomingPlanType == null) {
            return;  // No upcoming plan to activate
        }
        
        LocalDateTime activationDate = (upcomingPlanActivationDate != null) 
            ? upcomingPlanActivationDate 
            : LocalDateTime.now();
        
        activatePlan(upcomingPlanType, upcomingPlanPaymentId, activationDate);
        
        // Clear upcoming plan fields
        this.upcomingPlanType = null;
        this.upcomingPlanActivationDate = null;
        this.upcomingPlanPaymentId = null;
        
        System.out.println("✅ Activated upcoming plan successfully");
    }
}

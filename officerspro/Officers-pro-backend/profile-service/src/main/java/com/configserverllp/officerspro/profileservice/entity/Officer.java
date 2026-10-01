package com.configserverllp.officerspro.profileservice.entity;

import com.configserverllp.officerspro.profileservice.config.AesEncryptor;
import com.configserverllp.officerspro.profileservice.entity.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "officers")
@Builder
public class Officer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "custom-id-generator")
    @GenericGenerator(name = "custom-id-generator", strategy = "com.configserverllp.officerspro.profileservice.entity.generator.CustomIdGenerator")
    @Column(name = "officer_id")
    private String officerId;

    @Convert(converter = AesEncryptor.class)
    private String officerName;

    @Convert(converter = AesEncryptor.class)
    private String officerAge;

    @Convert(converter = AesEncryptor.class)
    private String officerGender;

    @Convert(converter = AesEncryptor.class)
    private String officerPost;

    @Convert(converter = AesEncryptor.class)
    private String officerStation;

    @Column(name = "officer_email", unique = true)
    @Convert(converter = AesEncryptor.class)
    private String officerEmail;

    @Convert(converter = AesEncryptor.class)
    private String officerMobileNo;

    private boolean officerStatus;

    @Column(name = "admin_email")
    private String adminEmail;

    private String registeredByAdminEmail;

    @Column(name = "keycloak_user_id")
    private String keycloakUserId;

    @CreationTimestamp
    private LocalDateTime created_on;

    @UpdateTimestamp
    private LocalDateTime updated_at;

    // CHANGED: Document references instead of file entity relationships
    @Column(name = "aadhar_document_id")
    private String aadharDocumentId;

    @Column(name = "pan_document_id")
    private String panDocumentId;

    @Column(name = "passport_document_id")
    private String passportDocumentId;

    // Subscription fields
    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType;
    
    private LocalDateTime subscriptionStartDate;
    
    private LocalDateTime subscriptionEndDate;
    
    private Long remainingDays;

    private String lastPaymentId;

    private LocalDateTime lastPaymentDate;

    // Subscription helper methods (same as cms-backend)
    
    /**
     * Sets the end date of the subscription and auto-updates remainingDays
     */
    public void setSubscriptionEndDate(LocalDateTime subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
        updateRemainingDays();
    }

    /**
     * Calculates days between now and subscriptionEndDate. Sets it to 0 if expired.
     */
    public void updateRemainingDays() {
        if (subscriptionEndDate != null) {
            this.remainingDays = ChronoUnit.DAYS.between(LocalDateTime.now(), subscriptionEndDate);
            if (this.remainingDays < 0) {
                this.remainingDays = 0L;
            }
        } else {
            this.remainingDays = 0L;
        }
    }

    /**
     * Returns true if current time is before subscriptionEndDate
     */
    public boolean isSubscriptionValid() {
        return subscriptionEndDate != null && LocalDateTime.now().isBefore(subscriptionEndDate);
    }

    /**
     * Takes a new plan (ONE_MONTH, THREE_MONTHS, etc.).
     * Sets subscriptionStartDate to now.
     * Based on plan type, calculates subscriptionEndDate.
     * If paymentId is provided, sets lastPaymentId and lastPaymentDate.
     * Calls updateRemainingDays().
     */
    public void updateSubscription(SubscriptionType newPlan, String paymentId) {
        LocalDateTime now = LocalDateTime.now();
        this.subscriptionType = newPlan;
        this.subscriptionStartDate = now;

        switch (newPlan) {
            case ONE_MONTH:
                this.subscriptionEndDate = now.plusDays(30);
                break;
            case THREE_MONTHS:
                this.subscriptionEndDate = now.plusDays(90);
                break;
            case SIX_MONTHS:
                this.subscriptionEndDate = now.plusDays(180);
                break;
            case TWELVE_MONTHS:
                this.subscriptionEndDate = now.plusDays(365);
                break;
            case FREE:
                this.subscriptionEndDate = null;
                break;
        }

        if (paymentId != null) {
            this.lastPaymentId = paymentId;
            this.lastPaymentDate = now;
        }

        updateRemainingDays();
    }

}

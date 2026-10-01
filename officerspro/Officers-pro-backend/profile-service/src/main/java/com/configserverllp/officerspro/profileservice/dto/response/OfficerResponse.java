package com.configserverllp.officerspro.profileservice.dto.response;

import com.configserverllp.officerspro.profileservice.entity.Officer;
import com.configserverllp.officerspro.profileservice.entity.enums.SubscriptionType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class OfficerResponse {

    private String officerId;
    private String officerName;
    private String officerAge;
    private String officerGender;
    private String officerPost;
    private String officerStation;
    private String officerEmail;
    private String officerMobileNo;
    private boolean officerStatus;
    private String adminEmail;
    private String registeredByAdminEmail;
    private String keycloakUserId;
    private LocalDateTime created_on;
    private LocalDateTime updated_at;

    // Document IDs
    private String aadharDocumentId;
    private String panDocumentId;
    private String passportDocumentId;

    // Subscription details
    private SubscriptionType subscriptionType;
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
    private Long remainingDays;
    private String lastPaymentId;
    private LocalDateTime lastPaymentDate;

    public OfficerResponse(Officer officer, String userId) {
        this.officerId = officer.getOfficerId();
        this.officerName = officer.getOfficerName();
        this.officerAge = officer.getOfficerAge();
        this.officerGender = officer.getOfficerGender();
        this.officerPost = officer.getOfficerPost();
        this.officerStation = officer.getOfficerStation();
        this.officerEmail = officer.getOfficerEmail();
        this.officerMobileNo = officer.getOfficerMobileNo();
        this.officerStatus = officer.isOfficerStatus();
        this.adminEmail = officer.getAdminEmail();
        this.registeredByAdminEmail = officer.getRegisteredByAdminEmail();
        this.keycloakUserId = userId;
        this.created_on = officer.getCreated_on();
        this.updated_at = officer.getUpdated_at();
        
        // Document IDs
        this.aadharDocumentId = officer.getAadharDocumentId();
        this.panDocumentId = officer.getPanDocumentId();
        this.passportDocumentId = officer.getPassportDocumentId();
        
        // Subscription details
        this.subscriptionType = officer.getSubscriptionType();
        this.subscriptionStartDate = officer.getSubscriptionStartDate();
        this.subscriptionEndDate = officer.getSubscriptionEndDate();
        this.remainingDays = officer.getRemainingDays();
        this.lastPaymentId = officer.getLastPaymentId();
        this.lastPaymentDate = officer.getLastPaymentDate();
    }
}

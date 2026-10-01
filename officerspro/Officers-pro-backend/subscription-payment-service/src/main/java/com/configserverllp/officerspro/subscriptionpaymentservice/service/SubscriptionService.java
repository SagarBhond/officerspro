package com.configserverllp.officerspro.subscriptionpaymentservice.service;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.OfficerSubscription;
import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import com.configserverllp.officerspro.subscriptionpaymentservice.repository.OfficerSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class SubscriptionService {

    @Autowired
    private OfficerSubscriptionRepository officerSubscriptionRepo;

    public boolean isSubscriptionValid(String email) {
        // Handle null or empty email
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        if(Objects.equals(email, "app_admin")){
            return true;
        }

        try {
            OfficerSubscription subscription = officerSubscriptionRepo.findByOfficerEmail(email)
                    .orElse(null);
            
            if (subscription == null) {
                return false;
            }

            if (subscription.getSubscriptionType() == null) {
                return false;
            }

            if (subscription.getSubscriptionType() == SubscriptionType.FREE) {
                return true;
            }

            return (subscription.getSubscriptionType() == SubscriptionType.ONE_MONTH ||
                    subscription.getSubscriptionType() == SubscriptionType.THREE_MONTHS ||
                    subscription.getSubscriptionType() == SubscriptionType.SIX_MONTHS ||
                    subscription.getSubscriptionType() == SubscriptionType.TWELVE_MONTHS) &&
                    subscription.getRemainingDays() != null && subscription.getRemainingDays() > 0;
        } catch (Exception e) {
            System.err.println("Error checking subscription validity for email: " + email + ", Error: " + e.getMessage());
            return false;
        }
    }
}

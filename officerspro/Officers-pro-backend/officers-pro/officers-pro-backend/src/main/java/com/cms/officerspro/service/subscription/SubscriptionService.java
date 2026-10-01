package com.cms.officerspro.service.subscription;

import com.cms.officerspro.entity.Officer;
import com.cms.officerspro.entity.enums.SubscriptionType;
import com.cms.officerspro.repository.OfficerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class SubscriptionService {

    @Autowired
    private OfficerRepo officerRepo;

    public boolean isSubscriptionValid(String email) {
        if(Objects.equals(email, "app_admin")){
            return true;
        }

        Officer officer = officerRepo.findByOfficerEmail(email)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (officer.getSubscriptionType() == SubscriptionType.FREE) {
            return true;
        }

        return (officer.getSubscriptionType() == SubscriptionType.ONE_MONTH ||
                officer.getSubscriptionType() == SubscriptionType.THREE_MONTHS ||
                officer.getSubscriptionType() == SubscriptionType.SIX_MONTHS ||
                officer.getSubscriptionType() == SubscriptionType.TWELVE_MONTHS) &&
                officer.getRemainingDays() > 0;
    }
}
package com.configserverllp.officerspro.subscriptionpaymentservice.repository;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.OfficerSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficerSubscriptionRepository extends JpaRepository<OfficerSubscription, Long> {
    
    Optional<OfficerSubscription> findByOfficerId(String officerId);
    
    Optional<OfficerSubscription> findByOfficerEmail(String officerEmail);
}

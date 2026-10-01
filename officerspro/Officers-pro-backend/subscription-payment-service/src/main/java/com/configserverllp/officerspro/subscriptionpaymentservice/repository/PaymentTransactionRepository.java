package com.configserverllp.officerspro.subscriptionpaymentservice.repository;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    List<PaymentTransaction> findByOfficerIdOrderByCreatedAtDesc(String officerId);
    
    List<PaymentTransaction> findByOfficerEmailOrderByCreatedAtDesc(String officerEmail);
    
    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();
    
    PaymentTransaction findByRazorpayOrderId(String razorpayOrderId);
}

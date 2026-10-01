package com.configserverllp.officerspro.subscriptionpaymentservice.service;

import com.configserverllp.officerspro.subscriptionpaymentservice.dto.AdminPaymentHistoryDto;
import com.configserverllp.officerspro.subscriptionpaymentservice.dto.OfficerPaymentHistoryDto;
import com.configserverllp.officerspro.subscriptionpaymentservice.entity.OfficerSubscription;
import com.configserverllp.officerspro.subscriptionpaymentservice.entity.PaymentTransaction;
import com.configserverllp.officerspro.subscriptionpaymentservice.repository.OfficerSubscriptionRepository;
import com.configserverllp.officerspro.subscriptionpaymentservice.repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentHistoryService {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private OfficerSubscriptionRepository officerSubscriptionRepository;

    public List<OfficerPaymentHistoryDto> getOfficerPaymentHistory(String officerId) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByOfficerIdOrderByCreatedAtDesc(officerId);
        
        return transactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<OfficerPaymentHistoryDto> getOfficerPaymentHistoryByEmail(String email) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByOfficerEmailOrderByCreatedAtDesc(email);
        
        return transactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AdminPaymentHistoryDto> getAllPaymentHistoryForAdmin() {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findAllByOrderByCreatedAtDesc();
        return transactions.stream()
                .map(this::convertToAdminDto)
                .collect(Collectors.toList());
    }

    private AdminPaymentHistoryDto convertToAdminDto(PaymentTransaction transaction) {
        AdminPaymentHistoryDto dto = new AdminPaymentHistoryDto();
        dto.setId(transaction.getId());
        dto.setRazorpayOrderId(transaction.getRazorpayOrderId());
        dto.setRazorpayPaymentId(transaction.getRazorpayPaymentId());
        dto.setRazorpaySignature(transaction.getRazorpaySignature());
        dto.setAmount(transaction.getAmount());
        dto.setCurrency(transaction.getCurrency());
        dto.setReceipt(transaction.getReceipt());
        dto.setStatus(transaction.getStatus());
        dto.setPlanType(transaction.getPlanType());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setUpdatedAt(transaction.getUpdatedAt());

        // Use directly stored data - simple like monolith!
        if (transaction.getOfficerName() != null && transaction.getOfficerEmail() != null) {
            dto.setOfficerName(transaction.getOfficerName());
            dto.setOfficerEmail(transaction.getOfficerEmail());
        } else {
            // Fallback for old records
            dto.setOfficerName(transaction.getOfficerName() != null ? transaction.getOfficerName() : "Unknown Officer");
            dto.setOfficerEmail(transaction.getOfficerEmail() != null ? transaction.getOfficerEmail() : "unknown@email.com");
        }

        return dto;
    }

    private OfficerPaymentHistoryDto convertToDto(PaymentTransaction transaction) {
        OfficerPaymentHistoryDto dto = new OfficerPaymentHistoryDto();
        dto.setId(transaction.getId());
        dto.setRazorpayOrderId(transaction.getRazorpayOrderId());
        dto.setRazorpayPaymentId(transaction.getRazorpayPaymentId());
        dto.setRazorpaySignature(transaction.getRazorpaySignature());
        dto.setAmount(transaction.getAmount());
        dto.setCurrency(transaction.getCurrency());
        dto.setReceipt(transaction.getReceipt());
        dto.setStatus(transaction.getStatus());
        dto.setPlanType(transaction.getPlanType());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setUpdatedAt(transaction.getUpdatedAt());
        return dto;
    }
}

package com.configserverllp.officerspro.subscriptionpaymentservice.dto;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OfficerPaymentHistoryDto {
    private Long id;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private Double amount;
    private String currency;
    private String receipt;
    private String status;
    private SubscriptionType planType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

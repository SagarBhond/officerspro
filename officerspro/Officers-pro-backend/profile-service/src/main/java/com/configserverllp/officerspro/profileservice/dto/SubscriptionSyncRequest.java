package com.configserverllp.officerspro.profileservice.dto;

import com.configserverllp.officerspro.profileservice.entity.enums.SubscriptionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionSyncRequest {
    private SubscriptionType subscriptionType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long remainingDays;
    private String paymentId;
    private LocalDateTime paymentDate;
}

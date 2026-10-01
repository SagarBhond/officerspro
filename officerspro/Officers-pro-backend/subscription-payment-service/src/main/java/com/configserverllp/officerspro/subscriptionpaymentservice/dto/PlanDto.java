package com.configserverllp.officerspro.subscriptionpaymentservice.dto;

import com.configserverllp.officerspro.subscriptionpaymentservice.entity.enums.SubscriptionType;
import lombok.Data;
import java.util.List;

@Data
public class PlanDto {
    private Long id;
    private String name;
    private Double price;
    private SubscriptionType duration;
    private Integer durationDays;
    private List<String> features;
    private boolean active;
}

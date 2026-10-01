package com.adminbackend.dto;

import com.adminbackend.dto.enums.SubscriptionType;
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

    // PlanDto.java
    private boolean active;

} 
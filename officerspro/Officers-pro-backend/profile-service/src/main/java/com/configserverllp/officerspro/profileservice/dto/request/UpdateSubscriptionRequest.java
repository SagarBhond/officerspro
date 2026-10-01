package com.configserverllp.officerspro.profileservice.dto.request;

import com.configserverllp.officerspro.profileservice.entity.enums.SubscriptionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSubscriptionRequest {
    private SubscriptionType subscriptionType;
}

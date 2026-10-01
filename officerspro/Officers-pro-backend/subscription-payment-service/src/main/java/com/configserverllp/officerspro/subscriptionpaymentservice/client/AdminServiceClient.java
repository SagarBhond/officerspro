package com.configserverllp.officerspro.subscriptionpaymentservice.client;

import com.configserverllp.officerspro.subscriptionpaymentservice.dto.PlanDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "admin-backend", url = "${admin.service.url}")
public interface AdminServiceClient {
    
    @GetMapping("/api/public/plans")
    List<PlanDto> getAllPlans();
}

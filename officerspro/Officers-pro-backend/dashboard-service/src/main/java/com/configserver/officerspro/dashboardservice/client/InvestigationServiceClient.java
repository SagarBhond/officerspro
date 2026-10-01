package com.configserver.officerspro.dashboardservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
    name = "investigation-service",
    url = "${investigation.service.url}"
)
public interface InvestigationServiceClient {
    
    @GetMapping("/api/investigations")
    List<Object> getAllInvestigations(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "1000") int size
    );
}

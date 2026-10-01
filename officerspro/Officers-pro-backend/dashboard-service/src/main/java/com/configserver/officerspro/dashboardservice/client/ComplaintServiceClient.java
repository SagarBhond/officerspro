package com.configserver.officerspro.dashboardservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(
    name = "complaintandfir-service1",
    url = "${complaint.service.url}"
)
public interface ComplaintServiceClient {
    
    @GetMapping("/api/victim/statements")
    Map<String, Object> getAllStatements(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10000") int size
    );
}

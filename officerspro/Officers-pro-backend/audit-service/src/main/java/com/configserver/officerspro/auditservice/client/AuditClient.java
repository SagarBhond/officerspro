package com.configserver.officerspro.auditservice.client;

import com.configserver.officerspro.auditservice.dto.APIRequestLogRequestDTO;
import com.configserver.officerspro.auditservice.dto.AuditTrailRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign Client interface for other services to integrate with Audit Service
 * Usage: Add this interface to your service's client package and configure Feign
 */
@FeignClient(name = "audit-service", url = "${audit.service.url:http://localhost:8086}")
public interface AuditClient {

    @PostMapping("/api/audit/add")
    void createAuditTrail(@RequestBody AuditTrailRequestDTO request);

    @PostMapping("/api/requests/log")
    void logAPIRequest(@RequestBody APIRequestLogRequestDTO request);
}

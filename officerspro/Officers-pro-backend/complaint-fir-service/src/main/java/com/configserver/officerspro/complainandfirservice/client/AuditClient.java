package com.configserver.officerspro.complainandfirservice.client;

import com.configserver.officerspro.complainandfirservice.audit.APIRequestLogRequestDTO;
import com.configserver.officerspro.complainandfirservice.audit.AuditTrailRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign Client to integrate with Audit Service
 * Usage: Inject this client and call methods to log audit trails and API requests
 */
@FeignClient(name = "audit-service", url = "${audit.service.url:http://localhost:8086}")
public interface AuditClient {

    @PostMapping("/api/audit/add")
    ResponseEntity<?> createAuditTrail(@RequestBody AuditTrailRequestDTO request);

    @PostMapping("/api/requests/log")
    ResponseEntity<?> logAPIRequest(@RequestBody APIRequestLogRequestDTO request);
}

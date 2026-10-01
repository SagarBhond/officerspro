package com.configserver.officerspro.helpsupportfeedbackservice.client;

import com.configserver.officerspro.helpsupportfeedbackservice.audit.APIRequestLogRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "audit-service", url = "${audit.service.url:http://localhost:8086}")
public interface AuditClient {

    @PostMapping("/api/requests/log")
    ResponseEntity<?> logAPIRequest(@RequestBody APIRequestLogRequestDTO request);
}

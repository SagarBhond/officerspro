package com.configserver.officerspro.investigationandcasediaryservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "profile-service", url = "${profile.service.url:http://localhost:8084}")
public interface ProfileServiceClient {

    @GetMapping("/api/profile/officers/email/{officerEmail}")
    ResponseEntity<Map<String, Object>> getOfficerByEmail(@PathVariable String officerEmail);
    
    @GetMapping("/api/profile/officers/{officerId}")
    ResponseEntity<Map<String, Object>> getOfficerById(@PathVariable String officerId);
}

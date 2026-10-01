package com.configserver.officerspro.helpsupportfeedbackservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", url = "${profile.service.url:http://localhost:8084/api/profile}")
public interface ProfileClient {

    @GetMapping("/officers/{officerId}")
    ResponseEntity<OfficerResponseDTO> getOfficerById(@PathVariable("officerId") String officerId);
}

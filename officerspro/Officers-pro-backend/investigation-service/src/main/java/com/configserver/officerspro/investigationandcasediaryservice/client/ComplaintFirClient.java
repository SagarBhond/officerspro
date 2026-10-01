package com.configserver.officerspro.investigationandcasediaryservice.client;

import com.configserver.officerspro.investigationandcasediaryservice.dto.CitizenDto;
import com.configserver.officerspro.investigationandcasediaryservice.dto.FirResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "complaintandfir-service1", url = "${complaint.fir.service.url:http://localhost:8082}")
public interface ComplaintFirClient {

    @GetMapping("/api/firs/{firId}/citizens")
    List<CitizenDto> getCitizensByFirId(@PathVariable("firId") String firId);

    @GetMapping("/api/firs/{firId}/witnesses")
    List<CitizenDto> getWitnessesByFirId(@PathVariable("firId") String firId);

    // Get FIR details by FIR ID
    @GetMapping("/api/victim/fir/{firId}")
    FirResponseDTO getFirByFirId(@PathVariable("firId") String firId);

    @PostMapping("/api/citizens")
    CitizenDto createCitizen(@RequestBody CitizenDto citizenDto);

}

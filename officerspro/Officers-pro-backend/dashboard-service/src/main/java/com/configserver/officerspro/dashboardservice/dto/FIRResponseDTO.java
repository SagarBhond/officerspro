package com.configserver.officerspro.dashboardservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FIRResponseDTO {
    private String firId;
    private String sections;
    private String description;
    private String status;
    private LocalDateTime registeredOn;
    private Integer officerId;
    private List<Map<String, Object>> victims;
    private List<Map<String, Object>> accused;
    private List<Map<String, Object>> witnesses;
    private Map<String, Object> complaint;
    private LocalDateTime crimeDateTime;
}

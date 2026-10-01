package com.configserver.officerspro.investigationandcasediaryservice.dto;

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
public class FirResponseDTO {
    private String firId; // Format: FIR_MH_PNE_2025_000001
    private Long complaintId;
    private String sections;
    private String description;
    private LocalDateTime registeredOn;
    private LocalDateTime crimeDateTime; // Date and time of offense
    private Integer officerId;
    private String status;
    private String firDocumentPath;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
    
    // Related data
    private List<Map<String, Object>> victims;
    private List<Map<String, Object>> accused;
    private List<Map<String, Object>> witnesses;
    private Map<String, Object> complaint;
}

package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceRequestDTO {
    private String investigationId; // Can be FIR ID or Investigation Code (String format)
    private Integer investigationInternalId; // Reference to specific Investigation entry by internal ID
    private String evidenceName; // Can be null - backend will use original filename
    private String description;
    private String evidenceType;
    private String fileType;
    private String locationFound;
    private String collectedBy;
    private LocalDateTime collectedOn;
}

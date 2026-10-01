package com.configserver.officerspro.investigationandcasediaryservice.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceDTO {

    private Integer evidenceId;
    private String investigationId; // Reference to Investigation by FIR ID or Investigation Code
    private Integer investigationInternalId; // Reference to specific Investigation entry by internal ID
    private String evidenceName;
    private String description;
    private String evidenceType;
    private String locationFound;
    private String collectedBy;
    private LocalDateTime collectedOn;
    private String fileType;
    private String filePath;
    private Long fileSize;
    private Integer documentId;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}

package com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Evidence details for ChargeSheet service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceDTO {
    private Integer evidenceId;
    private String evidenceCode; // String format: EVD/MH/PNE/2025/0001
    private String evidenceType;
    private String description;
    private String location;
    private String collectedBy;
    private LocalDateTime collectedOn;
    private String storageLocation;
    private String documentPath;
    private Integer pageCount;
}

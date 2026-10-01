package com.configserver.officerspro.investigationandcasediaryservice.dto;

import com.configserver.officerspro.investigationandcasediaryservice.enums.InvestigationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationDTO {
    private Integer internalId; // Unique database ID (primary key)
    private String investigationId; // Format: INV/MH/PNE/2025/000001
    private String firId; // Format: FIR_MH_PNE_2025_000001
    private Integer officerId;
    private LocalDateTime assignedOn;
    private String description;
    private InvestigationStatus status;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}

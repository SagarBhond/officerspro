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
public class InvestigationRequestDTO {
    private String firId; // Format: FIR_MH_PNE_2025_000001
    private Integer officerId;
    private LocalDateTime assignedOn;
    private InvestigationStatus status;
    private String description;
}

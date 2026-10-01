package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActiveInvestigationResponseDTO {

    private boolean exists;

    private Integer internalId;       // Auto-increment PK
    private String investigationId;   // investigation code: INV_XXXX
    private String firId;
    private Integer officerId;
    private String status;

    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;

    private String caseCode; // optional - pass null or actual if available
}

package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationByIdUpdateDTO {
    private Integer internalId; // Unique database ID (primary key) - PREFERRED
    private String investigationId; // Business ID - fallback for backward compatibility
    private String description;
}

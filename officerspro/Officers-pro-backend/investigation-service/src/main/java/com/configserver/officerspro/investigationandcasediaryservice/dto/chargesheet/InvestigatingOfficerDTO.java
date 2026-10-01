package com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Investigating Officer details for ChargeSheet service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigatingOfficerDTO {
    private Integer officerId;
    private String name;
    private String designation;
    private String badgeNumber;
    private String contactNumber;
    private String email;
}

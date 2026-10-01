package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FerristMasterDTO {

    private String ferristId;
    private String caseId;
    private String firId;
    private String investigationId;
    private Integer versionNumber;
    private Boolean isFinalized;
    private Boolean isConvertedToChargesheet;
    private String chargesheetId;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private Integer updatedBy;
    private LocalDateTime updatedAt;
    private String remarks;
}

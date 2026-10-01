package com.configserver.chargesheet.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChargesheetSubmitRequest {
    private String chargesheetId;
    private Integer submittedBy;
    private String courtName;
    private LocalDateTime hearingDate;
    private String remarks;
}

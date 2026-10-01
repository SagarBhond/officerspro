package com.configserver.chargesheet.dto;

import lombok.Data;

@Data
public class ChargesheetCreateRequest {
    private String ferristId;
    private String firId;
    private String complaintId;
    private Integer createdBy;
    private String courtName;
    private String remarks;
}

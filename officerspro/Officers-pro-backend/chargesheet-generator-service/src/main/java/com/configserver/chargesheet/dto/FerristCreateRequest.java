package com.configserver.chargesheet.dto;

import lombok.Data;

@Data
public class FerristCreateRequest {
    private String firId;
    private String investigationId;
    private String caseId;
    private Integer createdBy;
    private String remarks;
}

package com.configserver.chargesheet.dto;

import lombok.Data;
@Data
public class FerristVersionCreateRequest {
    private String previousFerristId;
    private Integer createdBy;
    private String remarks;
}

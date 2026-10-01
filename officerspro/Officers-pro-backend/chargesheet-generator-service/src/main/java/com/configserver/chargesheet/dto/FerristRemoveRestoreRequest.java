package com.configserver.chargesheet.dto;

import lombok.Data;

@Data
public class FerristRemoveRestoreRequest {
    private Integer userId;
    private String remarks;
    private Integer position; // for restore optional
}

package com.configserver.chargesheet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChargesheetActionResponse {
    private String chargesheetId;
    private String filePath;
    private String message;
}

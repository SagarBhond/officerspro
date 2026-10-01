package com.configserver.chargesheet.dto;

import lombok.Data;
import java.util.List;

@Data
public class FerristReorderRequest {
    private Integer updatedBy;
    private String remarks;
    private List<Long> newOrder; // ordered document IDs
}

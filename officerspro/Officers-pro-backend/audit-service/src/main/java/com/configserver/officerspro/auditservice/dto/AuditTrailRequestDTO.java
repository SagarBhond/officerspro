package com.configserver.officerspro.auditservice.dto;

import com.configserver.officerspro.auditservice.enums.ActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditTrailRequestDTO {

    private String tableName;
    private Long recordId;
    private ActionType action;
    private Long changedBy;
    private String beforeState;
    private String afterState;
    private String remarks;
}

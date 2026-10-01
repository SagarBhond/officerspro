package com.configserver.officerspro.auditservice.dto;

import com.configserver.officerspro.auditservice.enums.ActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditTrailDTO {

    private Long auditId;
    private String tableName;
    private Long recordId;
    private ActionType action;
    private Long changedBy;
    private LocalDateTime changedOn;
    private String beforeState;
    private String afterState;
    private String remarks;
}

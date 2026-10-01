package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for sending audit trail entries to the audit service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEntryRequest {
    /**
     * The name of the table/entity being audited (e.g., "investigation", "complaint")
     */
    private String tableName;

    /**
     * The ID of the record being audited (can be null for general API requests)
     */
    private Long recordId;

    /**
     * The action being performed (e.g., "CREATE", "UPDATE", "DELETE")
     */
    private String action;

    /**
     * ID of the user who performed the action
     */
    private Long changedBy;

    /**
     * Timestamp when the action was performed
     */
    private LocalDateTime changedOn;

    /**
     * The state before the change (can be null for new records)
     */
    private String beforeState;

    /**
     * The state after the change
     */
    private String afterState;

    /**
     * Additional remarks or context about the audit entry
     */
    private String remarks;
}

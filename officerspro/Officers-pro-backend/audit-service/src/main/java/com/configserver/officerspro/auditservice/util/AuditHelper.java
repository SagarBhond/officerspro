package com.configserver.officerspro.auditservice.util;

import com.configserver.officerspro.auditservice.dto.AuditTrailRequestDTO;
import com.configserver.officerspro.auditservice.enums.ActionType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Helper class for creating audit trail entries
 * Simplifies the process of logging data changes
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditHelper {

    private final ObjectMapper objectMapper;

    public AuditTrailRequestDTO createAuditEntry(
            String tableName,
            Long recordId,
            ActionType action,
            Long changedBy,
            Object beforeState,
            Object afterState,
            String remarks) {

        return AuditTrailRequestDTO.builder()
                .tableName(tableName)
                .recordId(recordId)
                .action(action)
                .changedBy(changedBy)
                .beforeState(serializeToJson(beforeState))
                .afterState(serializeToJson(afterState))
                .remarks(remarks)
                .build();
    }

    public AuditTrailRequestDTO createAuditEntry(
            String tableName,
            Long recordId,
            ActionType action,
            Long changedBy) {

        return createAuditEntry(tableName, recordId, action, changedBy, null, null, null);
    }

    private String serializeToJson(Object object) {
        if (object == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            log.error("Failed to serialize object to JSON: {}", e.getMessage());
            return object.toString();
        }
    }
}

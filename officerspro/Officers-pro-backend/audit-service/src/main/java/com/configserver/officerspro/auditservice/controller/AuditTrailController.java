package com.configserver.officerspro.auditservice.controller;

import com.configserver.officerspro.auditservice.dto.AuditTrailDTO;
import com.configserver.officerspro.auditservice.dto.AuditTrailRequestDTO;
import com.configserver.officerspro.auditservice.enums.ActionType;
import com.configserver.officerspro.auditservice.service.AuditTrailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit Trail", description = "Audit trail management APIs")
public class AuditTrailController {

    private final AuditTrailService auditTrailService;

    @PostMapping("/add")
    @Operation(summary = "Create new audit trail entry")
    public ResponseEntity<AuditTrailDTO> createAuditTrail(@RequestBody AuditTrailRequestDTO requestDTO) {
        log.info("REST request to create audit trail for table: {}", requestDTO.getTableName());
        AuditTrailDTO auditTrailDTO = auditTrailService.createAuditTrail(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(auditTrailDTO);
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all audit trail logs")
    public ResponseEntity<List<AuditTrailDTO>> getAllAuditTrails() {
        log.info("REST request to get all audit trails");
        List<AuditTrailDTO> auditTrails = auditTrailService.getAllAuditTrails();
        return ResponseEntity.ok(auditTrails);
    }

    @GetMapping("/logs/{auditId}")
    @Operation(summary = "Get audit trail by ID")
    public ResponseEntity<AuditTrailDTO> getAuditTrailById(@PathVariable Long auditId) {
        log.info("REST request to get audit trail: {}", auditId);
        AuditTrailDTO auditTrailDTO = auditTrailService.getAuditTrailById(auditId);
        return ResponseEntity.ok(auditTrailDTO);
    }

    @GetMapping("/logs/table/{tableName}")
    @Operation(summary = "Get audit trails by table name")
    public ResponseEntity<List<AuditTrailDTO>> getAuditTrailsByTableName(@PathVariable String tableName) {
        log.info("REST request to get audit trails for table: {}", tableName);
        List<AuditTrailDTO> auditTrails = auditTrailService.getAuditTrailsByTableName(tableName);
        return ResponseEntity.ok(auditTrails);
    }

    @GetMapping("/logs/table/{tableName}/record/{recordId}")
    @Operation(summary = "Get audit trails by table name and record ID")
    public ResponseEntity<List<AuditTrailDTO>> getAuditTrailsByTableAndRecordId(
            @PathVariable String tableName,
            @PathVariable Long recordId) {
        log.info("REST request to get audit trails for table: {}, record: {}", tableName, recordId);
        List<AuditTrailDTO> auditTrails = auditTrailService.getAuditTrailsByTableAndRecordId(tableName, recordId);
        return ResponseEntity.ok(auditTrails);
    }

    @GetMapping("/logs/user/{userId}")
    @Operation(summary = "Get audit trails by user ID")
    public ResponseEntity<List<AuditTrailDTO>> getAuditTrailsByUserId(@PathVariable Long userId) {
        log.info("REST request to get audit trails for user: {}", userId);
        List<AuditTrailDTO> auditTrails = auditTrailService.getAuditTrailsByUserId(userId);
        return ResponseEntity.ok(auditTrails);
    }

    @GetMapping("/logs/action/{action}")
    @Operation(summary = "Get audit trails by action type")
    public ResponseEntity<List<AuditTrailDTO>> getAuditTrailsByAction(@PathVariable ActionType action) {
        log.info("REST request to get audit trails for action: {}", action);
        List<AuditTrailDTO> auditTrails = auditTrailService.getAuditTrailsByAction(action);
        return ResponseEntity.ok(auditTrails);
    }

    @GetMapping("/logs/date-range")
    @Operation(summary = "Get audit trails by date range")
    public ResponseEntity<List<AuditTrailDTO>> getAuditTrailsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("REST request to get audit trails between {} and {}", startDate, endDate);
        List<AuditTrailDTO> auditTrails = auditTrailService.getAuditTrailsByDateRange(startDate, endDate);
        return ResponseEntity.ok(auditTrails);
    }
}

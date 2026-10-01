package com.configserver.officerspro.auditservice.entity;

import com.configserver.officerspro.auditservice.enums.ActionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_trail")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditTrail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long auditId;

    @Column(name = "table_name", nullable = false, length = 100)
    private String tableName;

    @Column(name = "record_id", nullable = false)
    private Long recordId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private ActionType action;

    @Column(name = "changed_by", nullable = false)
    private Long changedBy;

    @CreationTimestamp
    @Column(name = "changed_on", nullable = false, updatable = false)
    private LocalDateTime changedOn;

    @Column(name = "before_state", columnDefinition = "JSON")
    private String beforeState;

    @Column(name = "after_state", columnDefinition = "JSON")
    private String afterState;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
}

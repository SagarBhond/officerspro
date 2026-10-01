package com.configserver.officerspro.helpsupportfeedbackservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_audit_trail")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportAuditTrail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Integer auditId;

    @Column(name = "ticket_id", nullable = false)
    private Integer ticketId;

    @Column(name = "action_by", nullable = false)
    private Integer actionBy; // FK → AppUser (Who did what)

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType; // "Commented", "Assigned", "Status Changed", etc.

    @Column(name = "action_time", nullable = false)
    private LocalDateTime actionTime;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "mac_address", length = 50)
    private String macAddress;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "created_on", nullable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @PrePersist
    protected void onCreate() {
        createdOn = LocalDateTime.now();
        if (actionTime == null) {
            actionTime = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedOn = LocalDateTime.now();
    }
}

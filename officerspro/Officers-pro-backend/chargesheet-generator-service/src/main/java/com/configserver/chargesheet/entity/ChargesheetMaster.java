package com.configserver.chargesheet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chargesheet_master")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChargesheetMaster {

    @Id
    @Column(name = "chargesheet_id", length = 60)
    private String chargesheetId;

    @Column(name = "ferrist_id", length = 60)
    private String ferristId;

    @Column(name = "case_id", length = 60)
    private String caseId;

    @Column(name = "fir_id", length = 60)
    private String firId;

    @Column(name = "investigation_id", length = 60)
    private String investigationId;

    @Column(name = "version_number")
    private Integer versionNumber;

    @Column(name = "is_submitted")
    private Boolean isSubmitted = false;

    @Column(name = "court_name", length = 60)
    private String courtName;

    @Column(name = "hearing_date")
    private LocalDateTime hearingDate;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "submitted_by")
    private Integer submittedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    public void prePersist(){
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isSubmitted == null) isSubmitted = false;
    }
}

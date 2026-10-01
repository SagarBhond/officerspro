package com.configserver.chargesheet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ferrist_master",
        uniqueConstraints = @UniqueConstraint(columnNames = {"case_id","version_number"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FerristMaster {

    @Id
    @Column(name = "ferrist_id", length = 60)
    private String ferristId;

    //nullable =true changed later fix
    @Column(name = "case_id", length = 60, nullable = true)
    private String caseId;

    @Column(name = "fir_id", length = 60, nullable = false)
    private String firId;

    @Column(name = "investigation_id", length = 60, nullable = false)
    private String investigationId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "is_finalized")
    private Boolean isFinalized = false;

    @Column(name = "is_converted_to_chargesheet")
    private Boolean isConvertedToChargesheet = false;

    @Column(name = "chargesheet_id", length = 60)
    private String chargesheetId;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @PrePersist
    public void prePersist(){
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (versionNumber == null) versionNumber = 1;
        if (isFinalized == null) isFinalized = false;
        if (isConvertedToChargesheet == null) isConvertedToChargesheet = false;
    }
}

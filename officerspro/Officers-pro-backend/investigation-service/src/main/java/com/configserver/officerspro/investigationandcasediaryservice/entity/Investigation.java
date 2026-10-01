package com.configserver.officerspro.investigationandcasediaryservice.entity;

import com.configserver.officerspro.investigationandcasediaryservice.enums.InvestigationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Investigation")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Investigation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "internal_id")
    private Integer internalId; // Auto-increment primary key
    
    @Column(name = "investigation_id", length = 60)
    private String investigationId; // Format: INV_MH_PNE_2025_000001 (can be same for same FIR)

    // FIR ID reference - using string format to match complaint service
    // Multiple investigations allowed for same FIR ID with same investigation_id
    @Column(name = "fir_id", length = 60)
    private String firId; // Format: FIR_MH_PNE_2025_000001

    @Column(name = "officer_id")
    private Integer officerId;

    @Column(name = "assigned_on")
    private LocalDateTime assignedOn;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private InvestigationStatus status;

    @Column(name = "description", columnDefinition = "TEXT", length = 10000)
    private String description;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}

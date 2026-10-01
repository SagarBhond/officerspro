package com.configserver.officerspro.investigationandcasediaryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Evidence")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Evidence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer evidenceId;

    @Column(name = "investigation_id", length = 60)
    private String investigationId; // Reference to Investigation by FIR ID or Investigation Code

    @Column(name = "investigation_internal_id")
    private Integer investigationInternalId; // Reference to specific Investigation entry by internal ID

    @Column(name = "evidence_name", length = 500)
    private String evidenceName;

    @Column(name = "description", columnDefinition = "TEXT", length = 10000)
    private String description;

    @Column(name = "evidence_type")
    private String evidenceType;

    @Column(name = "location_found", length = 500)
    private String locationFound;

    @Column(name = "collected_by")
    private String collectedBy;

    @Column(name = "collected_on")
    private LocalDateTime collectedOn;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}

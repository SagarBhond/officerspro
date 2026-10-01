package com.configserver.officerspro.investigationandcasediaryservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "ForensicReport")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class ForensicReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer forensicReportId;

    @Column(name = "evidence_id")
    private Integer evidenceId;

    @Column(name = "report_date")
    private LocalDateTime reportDate;

    @Column(name = "report_text", columnDefinition = "TEXT")
    private String reportText;

    @Column(name = "lab_name")
    private String labName;

    @Column(name = "expert_name")
    private String expertName;

    @Column(name = "report_number")
    private String reportNumber;

    @Column(name = "findings")
    private String findings;

    @Column(name = "conclusion")
    private String conclusion;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}

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
@Table(name = "EvidenceDocument")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer evidenceDocumentId;

    @Column(name = "evidence_id")
    private Integer evidenceId;

    @Column(name = "document_id")
    private Integer documentId;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_on")
    private LocalDateTime createdOn;
}

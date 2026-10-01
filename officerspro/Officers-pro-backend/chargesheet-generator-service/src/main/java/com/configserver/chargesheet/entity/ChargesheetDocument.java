package com.configserver.chargesheet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chargesheet_document")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChargesheetDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chargesheet_document_id")
    private Long chargesheetDocumentId;

    @Column(name = "chargesheet_id", length = 60)
    private String chargesheetId;

    @Column(name = "document_id")
    private Long documentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", length = 30)
    private DocumentType documentType;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum DocumentType {
        MERGED_FINAL_PDF
    }

    @PrePersist
    public void prePersist(){
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

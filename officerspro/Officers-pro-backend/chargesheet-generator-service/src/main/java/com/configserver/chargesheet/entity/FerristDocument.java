package com.configserver.chargesheet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ferrist_document",
        indexes = {
                @Index(name = "idx_fd_ferristid", columnList = "ferrist_id"),
                @Index(name = "idx_fd_documentid", columnList = "document_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FerristDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ferrist_document_id")
    private Long ferristDocumentId;

    @Column(name = "ferrist_id", length = 60, nullable = false)
    private String ferristId;

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @Column(name = "sequence_number")
    private Integer sequenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 20)
    private ActionType actionType;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;      // NEW: stable description to use for chargesheet

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    public enum ActionType {
        ADDED, DELETED, RESTORED, REORDERED
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
    }
}

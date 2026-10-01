package com.configserver.officerspro.helpsupportfeedbackservice.entity;

import com.configserver.officerspro.helpsupportfeedbackservice.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "help_and_support")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpAndSupport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Integer ticketId;

    @Column(name = "raised_by_user_id", nullable = false)
    private Integer raisedByUserId; // FK → CMS.User (Officer who raised ticket)

    @Column(name = "officer_uuid", length = 255)
    private String officerUuid; // Actual officer UUID for fetching officer details from profile service

    @Column(name = "assigned_to")
    private Integer assignedTo; // FK → AppUser (Support user assigned)

    @Column(name = "assigned_by")
    private Integer assignedBy; // FK → AppUser (Manager/Admin)

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TicketStatus status;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "created_on", nullable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @Column(name = "attachment_document_id")
    private Long attachmentDocumentId; // FK → Document Service (screenshot/attachment)

    // Remove bidirectional mappings to avoid cascade issues
    // Comments, ratings, and audit trails can be fetched separately using repositories

    @PrePersist
    protected void onCreate() {
        createdOn = LocalDateTime.now();
        if (status == null) {
            status = TicketStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedOn = LocalDateTime.now();
    }
}

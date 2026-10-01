package com.configserver.officerspro.helpsupportfeedbackservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "help_and_support_comment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpAndSupportComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer commentId;

    @Column(name = "ticket_id", nullable = false)
    private Integer ticketId;

    @Column(name = "commented_by", nullable = false)
    private Integer commentedBy; // FK → AppUser or CMS.User

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "attachment_document_id")
    private Integer attachmentDocumentId; // FK → Document (optional screenshot/file)

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedOn = LocalDateTime.now();
    }
}

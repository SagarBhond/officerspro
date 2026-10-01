package com.configserverllp.officerspro.documentmanagementservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", length = 500)
    private String filePath;  // NEW: Local file storage path

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Column(name = "uploaded_on", nullable = false)
    private LocalDateTime uploadedOn;

    @Column(name = "linked_to", nullable = false, length = 50)
    private String linkedTo;  // e.g. WC, FIR, EVIDENCE, CHARGESHEET, JUDGMENT

    @Column(name = "link_id", length = 100)
    private String linkId;    // ID of the linked entity (e.g., "officer_xyz", "fir_01")

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_on", nullable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;
}
package com.configserverllp.officerspro.documentmanagementservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for DocumentEntity.
 * Used in request and response payloads.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {

    private Long documentId;

    @NotBlank(message = "File name is required.")
    @Size(max = 255, message = "File name cannot exceed 255 characters.")
    private String fileName;

    private String filePath;  // NEW: Local file storage path

    @NotNull(message = "UploadedBy is required.")
    private Long uploadedBy;

    @NotNull(message = "UploadedOn is required.")
    private LocalDateTime uploadedOn;

    @NotBlank(message = "LinkedTo value is required.")
    @Size(max = 50, message = "LinkedTo cannot exceed 50 characters.")
    private String linkedTo;   // e.g. FIR, EVIDENCE, WC, etc.

    private String linkId;     // ID of the linked entity (e.g., "officer_xyz", "fir_01")

    @NotNull(message = "CreatedBy is required.")
    private Long createdBy;

    @NotNull(message = "CreatedOn is required.")
    private LocalDateTime createdOn;

    private Long updatedBy;
    private LocalDateTime updatedOn;
}
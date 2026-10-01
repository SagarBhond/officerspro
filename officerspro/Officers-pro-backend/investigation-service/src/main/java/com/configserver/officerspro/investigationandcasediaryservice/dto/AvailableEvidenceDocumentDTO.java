package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableEvidenceDocumentDTO {

    private Integer evidenceDocumentId;
    private Integer evidenceId;
    private String investigationId;

    // Evidence fields
    private String evidenceName;
    private String description;
    private String evidenceType;
    private String locationFound;
    private String collectedBy;
    private LocalDateTime collectedOn;

    // File metadata (from evidence)
    private String fileType;
    private String filePath;
    private Long fileSize;

    // Document metadata (from Document Service)
    private Long documentId;
    private String fileName;
    private String documentUrl;
    private LocalDateTime uploadedOn;
}

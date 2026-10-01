package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Integer documentId;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private String documentType;
    private Integer uploadedBy;
    private LocalDateTime uploadedOn;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}


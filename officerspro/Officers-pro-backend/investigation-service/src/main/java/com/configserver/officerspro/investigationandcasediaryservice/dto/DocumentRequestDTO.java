package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for document upload requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequestDTO {
    @NotNull(message = "Document type is required")
    private String documentType;
    
    @NotNull(message = "Uploaded by user ID is required")
    private Integer uploadedBy;
    
    @NotNull(message = "Investigation ID is required")
    private String investigationId;
    
    // Optional: Only required when linking to specific evidence
    private Integer evidenceId;
    
    // Optional: Will be set from the uploaded file
    private String fileName;
    
    // Optional: Additional description for the document
    private String description;
}

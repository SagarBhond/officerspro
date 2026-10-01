package com.configserver.officerspro.complainandfirservice.dto.chargesheet;

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
    private Long documentId;
    private String fileName;
    private String mimeType;
    private String linkedTo; // FIR, INVESTIGATION, EVIDENCE, etc.
    private String linkId; // String format ID
    private String fileUrl; // Local file path or URL
    private Long sizeBytes;
    private Integer pageCount; // For PDFs
    private String description;
    private Integer createdBy;
    private LocalDateTime createdAt;
}

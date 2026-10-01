package com.configserver.chargesheet.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponseDTO {
    private Long documentId;
    private String fileName;
    private String mimeType;
    private String linkedTo;
    private String linkId;
    private String s3Link;
    private Long sizeBytes;
    private Integer pageCount;
    private Integer createdBy;
    private String createdAt;
    private String description;
}

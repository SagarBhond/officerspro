package com.configserver.chargesheet.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultimediaResponseDTO {
    private Long multimediaId;
    private String evidenceId;
    private String fileName;
    private String mimeType;
    private String s3Link;
    private String s3Bucket;
    private String s3Key;
    private Integer durationSeconds;
    private Long fileSize;
    private String resolution;
    private Integer bitrateKbps;
    private Integer createdBy;
    private String createdAt;
}

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
public class EvidenceDocumentDTO {
    private Integer evidenceDocumentId;
    private Integer evidenceId;
    private Integer documentId;
    private Integer createdBy;
    private LocalDateTime createdOn;
}

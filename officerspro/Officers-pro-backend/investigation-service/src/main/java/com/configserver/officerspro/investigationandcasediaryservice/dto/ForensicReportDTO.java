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
public class ForensicReportDTO {
    private Integer forensicReportId;
    private Integer evidenceId;
    private LocalDateTime reportDate;
    private String reportText;
    private String labName;
    private String expertName;
    private String reportNumber;
    private String findings;
    private String conclusion;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}

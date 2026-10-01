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
public class PanchnamaDTO {
    private Integer panchnamaId;
    private Integer evidenceId;
    private LocalDateTime panchnamaDate;
    private String panchnamaText;
    private String witness1Name;
    private String witness1Address;
    private String witness2Name;
    private String witness2Address;
    private String officerSignature;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}

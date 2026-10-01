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
public class WitnessRequestDTO {
    private Integer investigationId;
    private String witnessName;
    private String witnessEmail;
    private String witnessProfession;
    private String witnessGender;
    private String witnessAddress;
    private Integer witnessAge;
    private String witnessAadharNo;
    private String witnessMobileNo;
    private String witnessStatement;
    private String witnessType;
    private String aadharFilePath;
    private String panFilePath;
    private String passportFilePath;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}

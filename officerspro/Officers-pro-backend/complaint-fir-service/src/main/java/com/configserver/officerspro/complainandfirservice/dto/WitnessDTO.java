package com.configserver.officerspro.complainandfirservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WitnessDTO {
    private Integer witnessId;
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
    private String firId; // Changed to String to match FIR entity
    private String aadharPath;
    private String panPath;
    private String photoPath;
}

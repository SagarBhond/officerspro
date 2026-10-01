package com.cms.officerspro.dto;

import com.cms.officerspro.entity.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class WitnessDto {

    private String witnessId;
    private String witnessName;
    private String witnessEmail;
    private String witnessProfession;
    private String witnessGender;
    private  String witnessAddress;
    private String witnessAge;
    private String witnessAadharNo;
    private String witnessMobileNo;
    private String witnessStatement;
    private String witnessType;
    private LocalDateTime created_on;
    private FileEntity aadharFile;
    private FileEntity panFile;
    private FileEntity passportFile;
}

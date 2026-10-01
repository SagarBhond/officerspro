package com.cms.officerspro.dto;

import com.cms.officerspro.entity.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VictimProfileDto {

    private String victimId;
    private String victimName;
    private String victimEmail;
    private String victimProfession;
    private String victimGender;
    private String victimAddress;
    private String victimAge;
    private String victimAadharNo;
    private String victimMobileNo;
    private String caseStatus;
    private String firNo;
    private String type;
    private LocalDateTime created_on;

    private FileEntity aadharFile;

    private FileEntity panFile;

    private FileEntity passportFile;
}

package com.cms.officerspro.dto;

import com.cms.officerspro.entity.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OffenderDto {
    private String offenderId;
    private String offenderName;
    private String offenderAge;
    private String offenderAddress;
    private String offenderAadharNo;
    private String offenderGender;
    private String offenderProfession;
    private String arrestedStatus;
    private String offenderDescription;

    private String sectionId;


    private FileEntity aadharFile;

    private FileEntity panFile;

    private FileEntity passportFile;

}

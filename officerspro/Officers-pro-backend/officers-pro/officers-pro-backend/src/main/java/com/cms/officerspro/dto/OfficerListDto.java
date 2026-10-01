package com.cms.officerspro.dto;

import com.cms.officerspro.entity.FileEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OfficerListDto {

    private String officerId;
    private String officerName;
    private String officerAge;
    private String officerGender;
    private String officerPost;
    private String officerStation;
    private String officerEmail;
    private String officerMobileNo;
    private boolean officerStatus;
    private FileEntity aadharFile;
    private FileEntity panFile;
    private FileEntity passportFile;
    private String password;
}

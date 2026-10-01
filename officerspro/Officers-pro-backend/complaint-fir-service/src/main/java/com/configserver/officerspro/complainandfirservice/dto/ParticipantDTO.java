package com.configserver.officerspro.complainandfirservice.dto;

import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantDTO {
    private Integer participantId;
    private Integer citizenId;
    private String name;
    private String gender;
    private String aadharNumber;
    private String email;
    private String contactNumber;
    private String profession;
    private String address;
    private String age;
    private ParticipantRole role;

    // For offenders - additional fields that might be specific to offenders
    private String offenderName;
    private String offenderEmail;
    private String offenderMobileNo;
    private String offenderAddress;
    private String offenderAadharNo;

    // File paths
    private String aadharPath;
    private String panPath;
    private String photoPath;
}

package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OffenderInfoDTO {
    private Integer offenderId;
    private String offenderName;
    private String contactNumber;
    private String address;
    private String arrestedStatus;
    private Integer offenderAge;
    private String offenderAddress;
    private String sectionId;
}

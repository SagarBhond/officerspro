package com.cms.officerspro.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.cms.officerspro.entity.FileEntity;

import com.cms.officerspro.entity.enums.SubscriptionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OfficerDto {
    private String officerId;
    private String officerName;
    private String officerAge;
    private String officerGender;
    private String officerPost;
    private String officerStation;
    private String officerEmail;
    private String officerMobileNo;
    private boolean officerStatus;
    private LocalDateTime created_on;
    private FileEntity aadharFile;
    private FileEntity panFile;
    private FileEntity passportFile;
    private List<VictimDto> victimList;
    private List<InvestigationDetailsDto> investigationDetailsList;
    private SubscriptionType subscriptionType;
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
}

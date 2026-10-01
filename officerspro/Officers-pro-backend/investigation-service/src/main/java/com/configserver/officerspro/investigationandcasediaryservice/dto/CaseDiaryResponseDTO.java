package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseDiaryResponseDTO {
    private List<InvestigationDTO> investigationDetailsList;
    private List<VictimInfoDTO> victimList;
    private String officerName;
    private String officerPost;
    private String officerStation;

    // Additional fields for complete case diary data
    private String policeStation;
    private String sectionId;
    private String victimDetails;
    private LocalDateTime crimeDateTime;
    private LocalDateTime filingDateTime;
    private String offenderDetails;
    private String arrestStatus;
    private String firNumber;
    private Long complaintId;
    private String crimeDescription;
    private String witnessDetails;
    private String witnessContactDetails;
}

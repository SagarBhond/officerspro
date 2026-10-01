package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationUpdateDTO {
    private String firId; // Changed from victimId to firId with String type
    private String caseStatus;
    private List<OffenderUpdateDTO> offenderList;
    private InvestigationDetailsDTO investigationDetails;
}

package com.configserver.officerspro.dashboardservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardCaseDTO {
    
    @JsonProperty("victimName")
    private String victimName;
    
    @JsonProperty("offenderName")
    private String offenderName;
    
    @JsonProperty("firNo")
    private String firNo;
    
    @JsonProperty("shortDescription")
    private String shortDescription;
    
    @JsonProperty("caseStatus")
    private String caseStatus;
    
    @JsonProperty("created_on")
    private LocalDateTime createdOn;
    
    @JsonProperty("complaintId")
    private String complaintId;
    
    @JsonProperty("sections")
    private String sections;
}

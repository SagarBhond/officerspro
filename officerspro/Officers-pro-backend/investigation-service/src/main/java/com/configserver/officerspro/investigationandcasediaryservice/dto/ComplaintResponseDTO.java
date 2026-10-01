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
public class ComplaintResponseDTO {
    private Long complaintId;
    private String complaintNumber;
    private String description;
    private LocalDateTime createdOn;
    private String status;
    private List<VictimInfoDTO> victimList;
    private List<OffenderInfoDTO> offenderList;
}

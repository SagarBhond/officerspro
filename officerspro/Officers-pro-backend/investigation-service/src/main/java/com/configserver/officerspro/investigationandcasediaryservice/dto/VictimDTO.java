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
public class VictimDTO {
    private Integer victimId;
    private String victimName;
    private String caseStatus;
    private List<OffenderDTO> offenderList;
}

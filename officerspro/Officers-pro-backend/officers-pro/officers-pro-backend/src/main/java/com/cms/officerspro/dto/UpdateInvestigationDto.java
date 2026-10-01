package com.cms.officerspro.dto;

import com.cms.officerspro.entity.InvestigationDetails;
import com.cms.officerspro.entity.Offender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInvestigationDto {

    private String victimId;
    private String caseStatus;
  //  private String arrestedStatus;
    private List<Offender> offenderList;
    private InvestigationDetails investigationDetails;
}

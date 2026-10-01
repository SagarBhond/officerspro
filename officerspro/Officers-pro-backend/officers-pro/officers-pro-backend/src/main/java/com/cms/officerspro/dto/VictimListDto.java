package com.cms.officerspro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VictimListDto {

    private String victimId;
    private String victimName;
    private String victimAddress;
    private String victimMobileNo;
    private String victimAge;
    private String type;
}

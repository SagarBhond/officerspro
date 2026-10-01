package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VictimInfoDTO {
    private Integer victimId;
    private String victimName;
    private String contactNumber;
    private String address;
    private Integer victimAge;
    private String victimProfession;
    private String victimAddress;
    private String victimMobileNo;
}

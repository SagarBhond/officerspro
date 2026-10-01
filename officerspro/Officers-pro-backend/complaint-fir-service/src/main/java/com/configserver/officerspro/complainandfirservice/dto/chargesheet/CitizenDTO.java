package com.configserver.officerspro.complainandfirservice.dto.chargesheet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenDTO {
    private Integer citizenId;
    private String name;
    private String address;
    private String contactNumber;
    private String aadharNo;
    private String email;
    private String status; // For accused: Arrested, Absconding, etc.
}

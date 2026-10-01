package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenDto {
    private Integer citizenId;
    private String name;
    private String contact;
    private String address;
    private String statement;
    private String role; // witness, victim, etc.
}

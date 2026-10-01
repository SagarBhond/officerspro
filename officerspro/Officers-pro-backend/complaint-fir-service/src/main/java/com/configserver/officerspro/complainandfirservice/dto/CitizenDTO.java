package com.configserver.officerspro.complainandfirservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenDTO {
    private Integer citizenId;
    private String name;
    private String gender;
    private LocalDate dob;
    private String aadharNo;
    private String contactNo;
    private String email;
    private String profession;
    private String address;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
}

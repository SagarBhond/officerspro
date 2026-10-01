package com.cms.officerspro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrimeDetailsDto {
    private String crimeId;
    private String crimeDescription;
    private String crimeAddress;
    private String crimeDateTime;
}

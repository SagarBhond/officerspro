package com.cms.officerspro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCrimeDetailsDto {

    private String crimeId;
    private String updatedCrimeDescription;
}

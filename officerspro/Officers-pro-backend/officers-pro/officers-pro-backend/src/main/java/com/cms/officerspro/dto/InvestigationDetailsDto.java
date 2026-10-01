package com.cms.officerspro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationDetailsDto {
    private String investId;
    private String investDescription;
    private LocalDateTime created_on;
}

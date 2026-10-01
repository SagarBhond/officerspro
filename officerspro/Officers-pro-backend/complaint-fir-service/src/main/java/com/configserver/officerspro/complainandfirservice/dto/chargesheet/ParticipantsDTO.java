package com.configserver.officerspro.complainandfirservice.dto.chargesheet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantsDTO {
    private List<CitizenDTO> complainants;
    private List<CitizenDTO> victims;
    private List<CitizenDTO> accused;
    private List<CitizenDTO> witnesses;
}

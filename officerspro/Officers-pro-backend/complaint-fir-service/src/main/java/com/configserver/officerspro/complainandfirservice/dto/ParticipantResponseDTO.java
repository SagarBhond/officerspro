package com.configserver.officerspro.complainandfirservice.dto;

import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantResponseDTO {
    private Long participantId;
    private Long citizenId;
    private String name;
    private String contactNo;
    private String address;
    private String aadharNo;
    private ParticipantRole role;
    private String statement;
}

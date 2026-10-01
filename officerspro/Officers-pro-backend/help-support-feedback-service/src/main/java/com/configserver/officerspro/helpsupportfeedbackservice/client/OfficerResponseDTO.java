package com.configserver.officerspro.helpsupportfeedbackservice.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerResponseDTO {
    private String officerId;
    private String officerName;
    private String officerAge;
    private String officerGender;
    private String officerPost;
    private String officerStation;
    private String officerEmail;
    private String officerMobileNo;
    private boolean officerStatus;
    private String adminEmail;
    private String registeredByAdminEmail;
    private LocalDateTime created_on;
    private LocalDateTime updated_at;
}

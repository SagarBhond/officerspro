package com.configserverllp.officerspro.profileservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatchOfficerRequest {

    private Boolean officerStatus;

    private String officerPost;

    private String officerStation;

    private String officerMobileNo;
}

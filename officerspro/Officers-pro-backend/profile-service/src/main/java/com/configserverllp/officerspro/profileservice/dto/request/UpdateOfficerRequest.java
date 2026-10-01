package com.configserverllp.officerspro.profileservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOfficerRequest {

    private String officerName;

    private String officerAge;

    private String officerGender;

    private String officerPost;

    private String officerStation;

    @Email(message = "Invalid email format")
    private String officerEmail;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Mobile number must be 10-15 digits")
    private String officerMobileNo;

    private String adminEmail;

    // Document IDs (optional updates)
    private String aadharDocumentId;

    private String panDocumentId;

    private String passportDocumentId;
}

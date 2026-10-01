package com.configserverllp.officerspro.profileservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOfficerRequest {

    @NotBlank(message = "Officer name is required")
    private String officerName;

    private String officerAge;
    private String officerGender;

    @NotBlank(message = "Officer post is required")
    private String officerPost;

    @NotBlank(message = "Officer station is required")
    private String officerStation;

    @NotBlank(message = "Officer email is required")
    @Email(message = "Invalid email format")
    private String officerEmail;

    @NotBlank(message = "Officer mobile number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Mobile number must be 10-15 digits")
    private String officerMobileNo;

    private String adminEmail;
    private String registeredByAdminEmail;

    // new field
    @NotBlank(message = "Password is required")
    private String password;

    private String aadharDocumentId;
    private String panDocumentId;
    private String passportDocumentId;
}

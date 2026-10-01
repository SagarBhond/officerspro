package com.adminbackend.dto;

import com.adminbackend.entity.Role;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpDto {

    private String firstName;
    private String lastName;
    private String email;
    private char[] password;
    //private String role;
    private String createdBy;
    private String role;
    private String mobile;
}

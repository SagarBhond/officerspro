package com.configserverllp.auth_server.dto;

import lombok.Data;

@Data
public class CreateAuthUserRequest {

    private String email;

    private String fullName;


    private String password;


    private String role;

    // Add this field
    private String realm = "OfficerPro"; // Default value
}
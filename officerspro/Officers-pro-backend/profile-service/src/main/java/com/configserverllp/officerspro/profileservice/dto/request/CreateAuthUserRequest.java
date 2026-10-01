package com.configserverllp.officerspro.profileservice.dto.request;

import lombok.Data;

@Data
public class CreateAuthUserRequest {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String password;
    private String role;
}

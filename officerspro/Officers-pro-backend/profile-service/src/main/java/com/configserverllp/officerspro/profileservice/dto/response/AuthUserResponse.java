package com.configserverllp.officerspro.profileservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserResponse {
    private String userId;
    private String username;
    private String role;
}

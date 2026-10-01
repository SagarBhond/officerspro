package com.configserverllp.auth_server.Controller;

import com.configserverllp.auth_server.dto.CreateAuthUserRequest;
import com.configserverllp.auth_server.dto.AuthUserResponse;
import com.configserverllp.auth_server.service.KeycloakUserService;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@PermitAll
@RequiredArgsConstructor
public class AuthController {

    private final KeycloakUserService keycloakUserService;

    // ✅ Public & private endpoints can remain
    @GetMapping("/public")
    public String publicEndpoint() {
        return "This is a public endpoint.";
    }

    @GetMapping("/private")
    public String privateEndpoint() {
        return "This is a private endpoint - requires Keycloak JWT.";
    }

    // ✅ New endpoint to create officer in Keycloak
    @PostMapping("/users")
    public AuthUserResponse createUser(@RequestBody CreateAuthUserRequest request) {
        return keycloakUserService.createUser(request);
    }
}

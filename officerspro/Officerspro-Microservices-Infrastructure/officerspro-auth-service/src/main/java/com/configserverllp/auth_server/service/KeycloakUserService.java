package com.configserverllp.auth_server.service;

import com.configserverllp.auth_server.dto.AuthUserResponse;
import com.configserverllp.auth_server.dto.CreateAuthUserRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakUserService {

    private static final String KEYCLOAK_BASE_URL = "http://localhost:8080";
    private static final String REALM = "OfficerPro"; // Your realm name
    private static final String ADMIN_CLI = "officerpro-admin"; // Your admin client ID

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    @Value("${keycloak.admin.client-secret}")
    private String adminClientSecret;

    private final RestTemplate restTemplate;

    public AuthUserResponse createUser(CreateAuthUserRequest request) {
        log.info("Creating Keycloak user for email: {}", request.getEmail());

        try {
            // Get admin token
            String adminToken = getAdminToken();
            if (adminToken == null) {
                throw new RuntimeException("Failed to authenticate with Keycloak admin");
            }

            // Create user payload
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("username", request.getEmail());
            userMap.put("email", request.getEmail());
            userMap.put("firstName", request.getFullName().split(" ")[0]);
            userMap.put("lastName", request.getFullName().split(" ").length > 1 ?
                    request.getFullName().split(" ")[1] : "");
            userMap.put("enabled", true);
            userMap.put("emailVerified", true);

            // Set password credentials
            userMap.put("credentials", Collections.singletonList(
                    Map.of(
                            "type", "password",
                            "value", request.getPassword(),
                            "temporary", false
                    )
            ));

            // Prepare and send request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(adminToken);

            String createUserUrl = String.format("%s/admin/realms/%s/users",
                    KEYCLOAK_BASE_URL, REALM);

            try {
                ResponseEntity<Void> response = restTemplate.exchange(
                        createUserUrl,
                        HttpMethod.POST,
                        new HttpEntity<>(userMap, headers),
                        Void.class
                );

                if (response.getStatusCode() != HttpStatus.CREATED) {
                    throw new RuntimeException("Failed to create user: " +
                            response.getStatusCode() + " - " + response.getBody());
                }

                // Extract user ID from location header
                String location = response.getHeaders().getFirst(HttpHeaders.LOCATION);
                if (location == null) {
                    throw new RuntimeException("No location header in response");
                }

                String userId = location.substring(location.lastIndexOf('/') + 1);
                log.info("Created user with ID: {}", userId);

                // Assign role
                assignRole(adminToken, userId, request.getRole());

                return new AuthUserResponse(userId, request.getEmail(), request.getRole());
            } catch (HttpClientErrorException e) {
                log.error("Keycloak API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                throw new RuntimeException("Failed to create user in Keycloak: " + e.getResponseBodyAsString(), e);
            }

        } catch (Exception e) {
            log.error("Error creating user in Keycloak", e);
            throw new RuntimeException("Error creating user: " + e.getMessage(), e);
        }
    }

    private String getAdminToken() {
        try {
            String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token",
                    KEYCLOAK_BASE_URL, REALM);

            log.debug("Requesting admin token from: {}", tokenUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", "officerpro-admin");
            body.add("client_secret", "7uW0Fiq7pvLIxlmOEhbRqnBru9dWJ1jQ");
            body.add("grant_type", "client_credentials");
//            body.add("username", adminUsername);
//            body.add("password", adminPassword);


            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            try {
                ResponseEntity<Map> response = restTemplate.exchange(
                        tokenUrl,
                        HttpMethod.POST,
                        request,
                        Map.class
                );

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    String token = (String) response.getBody().get("access_token");
                    log.debug("Successfully obtained admin token");
                    return token;
                } else {
                    log.error("Failed to get admin token: {} - {}",
                            response.getStatusCode(), response.getBody());
                    return null;
                }
            } catch (HttpClientErrorException e) {
                log.error("Authentication failed: {} - {}",
                        e.getStatusCode(), e.getResponseBodyAsString());
                return null;
            }

        } catch (Exception e) {
            log.error("Error getting admin token", e);
            return null;
        }
    }

    private void assignRole(String adminToken, String userId, String roleName) {
        try {
            // Get role
            String getRoleUrl = String.format("%s/admin/realms/%s/roles/%s",
                    KEYCLOAK_BASE_URL, REALM, roleName);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);

            // Get role details
            ResponseEntity<Map> roleResponse = restTemplate.exchange(
                    getRoleUrl,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );

            if (roleResponse.getStatusCode() != HttpStatus.OK || roleResponse.getBody() == null) {
                throw new RuntimeException("Failed to get role: " + roleName);
            }

            // Assign role
            String assignRoleUrl = String.format("%s/admin/realms/%s/users/%s/role-mappings/realm",
                    KEYCLOAK_BASE_URL, REALM, userId);

            HttpEntity<List<Map>> assignRequest = new HttpEntity<>(
                    Collections.singletonList(roleResponse.getBody()),
                    headers
            );

            restTemplate.exchange(
                    assignRoleUrl,
                    HttpMethod.POST,
                    assignRequest,
                    Void.class
            );

            log.info("Assigned role {} to user {}", roleName, userId);

        } catch (Exception e) {
            log.error("Error assigning role", e);
            throw new RuntimeException("Failed to assign role: " + e.getMessage(), e);
        }
    }
}

package com.adminbackend.service;

import com.adminbackend.config.KeycloakConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class KeycloakService {

    @Autowired
    private KeycloakConfig keycloakConfig;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getKeycloakAccessToken() {
        System.out.println("🔑 getKeycloakAccessToken method called");

        String url = keycloakConfig.getAuthTokenUrl();
        System.out.println("🌐 Keycloak Token URL: " + url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        System.out.println("🛡️ Set headers with Content-Type: application/x-www-form-urlencoded");

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("username", keycloakConfig.getUsername());
        body.add("password", keycloakConfig.getPassword());
        body.add("grant_type", keycloakConfig.getGrantType());
        body.add("client_id", keycloakConfig.getClientId());
        System.out.println("📝 Prepared request body with credentials and client info");

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
        System.out.println("📦 Created HttpEntity for token request");

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
            System.out.println("✅ Received response from Keycloak");

            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            String accessToken = jsonNode.get("access_token").asText();
            System.out.println("🔓 Extracted access token");

            return accessToken;
        } catch (Exception e) {
            System.err.println("❌ Error while fetching token: " + e.getMessage());
            throw new RuntimeException("Error occurred while getting access token from Keycloak: " + e.getMessage(), e);
        }
    }

}

//package com.configserverllp.officerspro.profileservice.config;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Component;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@Slf4j
//@Component
//public class KeycloakAdminTokenProvider {
//
//    @Value("${keycloak.server-url}")
//    private String keycloakServerUrl;
//
//    @Value("${keycloak.realm}")
//    private String realm;
//
//    @Value("${keycloak.client-id}")
//    private String clientId;
//
//    @Value("${keycloak.admin-username}")
//    private String adminUsername;
//
//    @Value("${keycloak.admin-password}")
//    private String adminPassword;
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    /**
//     * Fetch admin access token from Keycloak
//     */
//
//    public String getAccessToken() {
//        try {
//            String url = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//
//            String body = "grant_type=password"
//                    + "&client_id=" + clientId
//                    + "&username=" + adminUsername
//                    + "&password=" + adminPassword;
//
//            HttpEntity<String> entity = new HttpEntity<>(body, headers);
//
//            ResponseEntity<String> response = restTemplate.exchange(
//                    url,
//                    HttpMethod.POST,
//                    entity,
//                    String.class
//            );
//
//            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
//                ObjectMapper mapper = new ObjectMapper();
//                JsonNode jsonNode = mapper.readTree(response.getBody());
//                String token = jsonNode.get("access_token").asText();
//                log.info("✅ Successfully fetched Keycloak admin access token");
//                return token;
//            } else {
//                log.error("❌ Failed to get Keycloak admin token. Status: {}", response.getStatusCode());
//                throw new RuntimeException("Failed to retrieve admin token from Keycloak");
//            }
//
//        } catch (Exception e) {
//            log.error("❌ Error while fetching admin token from Keycloak", e);
//            throw new RuntimeException("Failed to fetch Keycloak admin token", e);
//        }
//    }
//
//}

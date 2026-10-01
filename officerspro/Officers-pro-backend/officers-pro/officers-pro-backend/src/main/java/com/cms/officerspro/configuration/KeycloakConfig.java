package com.cms.officerspro.configuration;

import lombok.Data;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "keycloak.config")
public class KeycloakConfig {

    private String frontendClientId;
    private String principalAttribute;

    private String backendClientId;
    private String serverUrl;
    private String realm;
    private String clientSecret;

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .serverUrl(serverUrl)
                .realm(realm)
                .clientId(backendClientId)
                .clientSecret(clientSecret)
                .build();
    }
}

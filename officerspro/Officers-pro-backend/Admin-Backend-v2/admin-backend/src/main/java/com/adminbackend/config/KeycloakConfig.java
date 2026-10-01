package com.adminbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "keycloak.config")
public class KeycloakConfig {

    private String authTokenUrl;
    private String username;
    private String password;
    private String grantType;
    private String clientId;
}

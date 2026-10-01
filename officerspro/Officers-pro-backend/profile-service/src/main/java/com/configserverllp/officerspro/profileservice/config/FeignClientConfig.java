package com.configserverllp.officerspro.profileservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ⚠️ DISABLED: Global Keycloak auth interceptor
 * 
 * This was adding Keycloak Bearer tokens to ALL Feign client calls,
 * including internal service calls (like AuthService).
 * 
 * For officer-facing endpoints that need Keycloak auth, create specific
 * FeignClient configurations instead of a global interceptor.
 */
@Configuration
@RequiredArgsConstructor
public class FeignClientConfig {

    private final KeycloakTokenService keycloakTokenService;

    // ❌ COMMENTED OUT: Don't apply Keycloak auth globally
    // Uncomment and apply selectively only to officer-facing external services
    
    // @Bean
    // public RequestInterceptor keycloakAuthInterceptor() {
    //     return new RequestInterceptor() {
    //         @Override
    //         public void apply(RequestTemplate template) {
    //             String token = keycloakTokenService.getAccessToken();
    //             template.header("Authorization", "Bearer " + token);
    //         }
    //     };
    // }
}

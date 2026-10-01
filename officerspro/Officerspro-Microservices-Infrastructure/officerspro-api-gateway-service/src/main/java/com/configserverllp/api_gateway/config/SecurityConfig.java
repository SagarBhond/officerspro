package com.configserverllp.api_gateway.config;

import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.DelegatingReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.oauth2.server.resource.authentication.JwtReactiveAuthenticationManager;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

/**
 * API Gateway Security Configuration
 * 
 * Security Architecture:
 * 1. Frontend → Keycloak: User logs in, receives JWT token
 * 2. Frontend → API Gateway: Sends requests with JWT in Authorization header
 * 3. API Gateway: Validates JWT and routes to microservices
 * 4. Microservices: Trust the gateway (no JWT validation needed internally)
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            ReactiveAuthenticationManager jwtAuthManager,
            CorsConfigurationSource corsConfigurationSource
    ) {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeExchange(exchange -> exchange
                        // Public endpoints - No JWT required (completely bypass security)
                        .pathMatchers(
                                "/api/auth/users",           // Internal service-to-service call
                                "/api/auth/public",          // Public auth endpoint
                                "/actuator/**",              // Health checks
                                "/fallback"                  // Circuit breaker fallback
                        ).permitAll()
                        
                        // Admin endpoints - permitAll (no JWT validation)
                        .pathMatchers(
                                "/api/documents/**",         // DocumentService - permitAll for admin
                                "/api/profile/officers",     // ProfileService POST /officers
                                "/api/profile/officers/**"   // ProfileService officers endpoints - permitAll for admin
                        ).permitAll()
                        
                        // Subscription/Payment endpoints - permitAll for testing
                        .pathMatchers(
                                "/api/payments/**",          // Payment endpoints
                                "/api/subscriptions/**",    // Subscription endpoints
                                "/api/payment-history/**"    // Payment history endpoints
                        ).permitAll()

                        // ComplaintAndFir Serive - permitAll
                        .pathMatchers(
                           "/api/victim/**",
                           "/api/witnesses/**"
                        ).permitAll()

                        // Investigation and Evidence Service
                        .pathMatchers(
                                "/api/casediary/**",
                                "/api/evidence/**",
                                "/api/investigation/**",
                                "/api/investigation"
                        ).permitAll()

                        //Court Case Management Service
                        .pathMatchers(
                                "/courtcases/**",
                                "/courtcases/{caseId}/documents/**",
                                "/courtcases/{caseId}/hearings/**",
                                "/judgement/**",
                                "/summon/**"
                        ).permitAll()


                        //dashboard service
                        .pathMatchers(

                                "/api/admin/**"
                        ).permitAll()

                        //helpandsupportand feddback
                        .pathMatchers(

                                "/api/support/**"
                        ).permitAll()
                        .pathMatchers("/ferrist/**","/chargesheet/**").permitAll()




                        //helpansupportfeedbackservice

                        .pathMatchers(
                                "/api/victim/feedback/**",
                                "/api/support/**",
                                "/api/**",
                                "/api/helpandsupport/**"
                        ).permitAll()

                        // All other endpoints require authentication
                        .anyExchange().authenticated()
                )
                // IMPORTANT: For permitAll paths, we need to completely bypass OAuth2 processing
                // The issue is that oauth2ResourceServer still tries to validate JWT even for permitAll
                // Solution: Only enable oauth2ResourceServer for paths that need authentication
                .oauth2ResourceServer(oauth2 -> {
                    oauth2.authenticationManagerResolver(exchange -> {
                        String path = exchange.getRequest().getPath().value();
                        // If path matches permitAll patterns, use no-op manager that always succeeds
                        if (path.startsWith("/api/documents/") || 
                            path.equals("/api/profile/officers") ||
                            path.startsWith("/api/profile/officers/") ||
                            path.startsWith("/api/payments/") ||
                            path.startsWith("/api/subscriptions/") ||
                            path.startsWith("/api/payment-history/") ||
                                path.startsWith("/api/victim/") ||
                                path.startsWith("/api/admin/") ||
                                path.startsWith("/api/helpandsupport/")||

                                path.startsWith("/api/witnesses/") ||
                                path.startsWith("/api/casediary/") ||
                                path.startsWith("/api/evidence/") ||
                                path.startsWith("/api/investigation/") ||
                                path.startsWith("/api/investigation") ||
                                path.startsWith("/courtcases/") ||
                                path.startsWith("/courtcases/{caseId}/documents/") ||
                                path.startsWith("/courtcases/{caseId}/hearings/") ||
                                path.startsWith("/judgement/") ||
                                path.startsWith("/summon/") ||
                                path.startsWith("/ferrist/") ||
                                path.startsWith("/chargesheet/") ||

                            path.startsWith("/api/auth/users") ||
                            path.startsWith("/api/auth/public") ||
                            path.startsWith("/actuator/") ||
                            path.equals("/fallback")) {
                            // Return a no-op manager that creates anonymous authentication
                            // This completely bypasses JWT validation for permitAll paths
                            return Mono.just(new ReactiveAuthenticationManager() {
                                @Override
                                public Mono<Authentication> authenticate(Authentication authentication) {
                                    // For permitAll paths, return anonymous authentication
                                    // This bypasses JWT validation completely
                                    AnonymousAuthenticationToken anonymous = new AnonymousAuthenticationToken(
                                        "permitAll-key",
                                        "anonymous",
                                        AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")
                                    );
                                    return Mono.just(anonymous);
                                }
                            });
                        }
                        // For other paths, validate JWT
                        return Mono.just(jwtAuthManager);
                    });
                });
        
        return http.build();
    }

    @Bean
    public ReactiveAuthenticationManager jwtAuthManager(
            @Value("${security.oauth2.resourceserver.jwt.keycloak-issuer:http://localhost:8080/realms/OfficerPro}") String keycloakIssuer,
            @Value("${security.oauth2.resourceserver.jwt.admin.secret}") String adminSecret
    ) {
        // Decoder for Keycloak (RS256 via OIDC discovery)
        ReactiveJwtDecoder keycloakDecoder = ReactiveJwtDecoders.fromIssuerLocation(keycloakIssuer);
        JwtReactiveAuthenticationManager keycloakManager = new JwtReactiveAuthenticationManager(keycloakDecoder);

        // Admin JWT decoder: Admin-backend Base64-encodes the secret before using it for HMAC512
        // This matches UserAuthProvider.init() which does: secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes())
        String base64EncodedSecret = java.util.Base64.getEncoder().encodeToString(adminSecret.getBytes(StandardCharsets.UTF_8));
        SecretKey adminSecretKey = new SecretKeySpec(base64EncodedSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        ReactiveJwtDecoder adminDecoder = NimbusReactiveJwtDecoder
                .withSecretKey(adminSecretKey)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
        JwtReactiveAuthenticationManager adminManager = new JwtReactiveAuthenticationManager(adminDecoder);

        // Try admin JWT first, then Keycloak JWT
        return new DelegatingReactiveAuthenticationManager(adminManager, keycloakManager);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(java.util.List.of(
                "http://localhost:5173",    // Vite React Frontend
                "http://localhost:3000",    // React Frontend
                "http://localhost:8081",    // Admin Backend
                "http://localhost:19006",   // Expo Web
                "http://10.0.2.2:19006",    // Android Emulator
                "http://192.168.1.52:19006" // LAN device
        ));
        corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(java.util.List.of("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

}

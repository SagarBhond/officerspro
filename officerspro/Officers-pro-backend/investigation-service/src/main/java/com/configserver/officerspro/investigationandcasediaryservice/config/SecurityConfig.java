package com.configserver.officerspro.investigationandcasediaryservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API endpoints
            .csrf(csrf -> csrf.disable())

            // Configure authorization
            .authorizeHttpRequests(authz -> authz
                // Allow all API endpoints without authentication (for development)
                .requestMatchers("/api/**").permitAll()
                // Allow Swagger/OpenAPI documentation
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**").permitAll()
                // Allow H2 console (if used)
                .requestMatchers("/h2-console/**").permitAll()
                // Allow all other requests without authentication for development
                .anyRequest().permitAll()
            )

            // Configure session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .cors(Customizer.withDefaults())

            // Disable HTTP Basic authentication
            .httpBasic(httpBasic -> httpBasic.disable())

            // Disable form login
            .formLogin(form -> form.disable());

        return http.build();
    }
}

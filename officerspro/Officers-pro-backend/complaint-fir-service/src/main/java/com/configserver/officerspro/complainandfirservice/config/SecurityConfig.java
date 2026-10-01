package com.configserver.officerspro.complainandfirservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // disable CSRF for testing POST/multipart
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll() // allow all /api/* endpoints
                        .requestMatchers("/**").permitAll() // allow everything for development
                        .anyRequest().authenticated()          // protect other endpoints
                )
                .cors(Customizer.withDefaults());

        return http.build();
    }
}

package com.adminbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.adminbackend.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final UserAuthenticationEntryPoint userAuthenticationEntryPoint;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(userAuthenticationEntryPoint))
                .addFilterBefore(jwtAuthFilter, BasicAuthenticationFilter.class)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests((requests) -> requests

                        // ✅ Swagger/OpenAPI endpoints (allow public)
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()


                        .requestMatchers("/api/admin/status/getAllOfficer-SubscriptionDetails").authenticated()
                        .requestMatchers("/api/admin/payment-history/all").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/admin/dashboard-summary", "/api/admin/total-users", "/api/admin/getTotalAllStatements", "/api/admin/total-managers", "/api/admin/cases/**", "/api/admin/victim/total-officers", "/api/admin/subscriptions/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/login", "/api/admin/register","/api/admin/forgot-password","/api/admin/refresh-token").permitAll()
                        .requestMatchers("/api/public/plans").permitAll()


                        .requestMatchers(HttpMethod.GET,"/api/admin/status/getAllOfficer-SubscriptionDetails/**").permitAll()
                        // Restrict all /api/admin/plans/** endpoints to ADMIN only
                        .requestMatchers("/api/admin/plans/**").hasAnyRole("ADMIN","MANAGER")


                        .requestMatchers(HttpMethod.POST, "/api/admin/entitlements/bulk").hasRole("ADMIN")
                      //  .requestMatchers("/api/admin/entitlements/by-user").hasAnyRole("ADMIN", "MANAGER","USER")
                        .requestMatchers("/api/admin/entitlements/by-user/*").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/admin/entitlements/assign-to-user").hasRole("ADMIN")
                        .requestMatchers("/api/admin/entitlements/**").hasAnyRole("ADMIN", "MANAGER")         // ✅ comes after

                       // .requestMatchers(HttpMethod.POST, "/api/admin/registerOfficer").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/admin/registerOfficer").permitAll()

                      .requestMatchers(HttpMethod.GET, "/api/admin/getOfficers").permitAll()
                       // .requestMatchers(HttpMethod.GET, "/api/admin/getFeedbackList").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/getFeedbackList").hasAuthority("Feedback:READ")
                        .requestMatchers(HttpMethod.GET, "/api/admin/getAllHelpAndSupport").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/getAllHelpAndSupport").permitAll()
                       // .requestMatchers(HttpMethod.PUT, "/api/admin/updateOfficer/*").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/admin/updateOfficer/*").hasAuthority("Update Officer:UPDATE")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/enableOrDisableOfficer/*").permitAll()
                       //.requestMatchers(HttpMethod.GET, "/api/admin/getOfficers").hasAuthority("ROLE_ADMIN")

                        .requestMatchers("/api/admin/plans/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/admin/registerOfficer").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/getOfficers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/profile").authenticated()
                        //.requestMatchers(HttpMethod.GET, "/api/admin/getOfficers").permitAll()
                       // .requestMatchers(HttpMethod.POST,"/api/admin/entitlements/bulk").hasRole("ADMIN")

                        // ✅ CHANGED: Allow DELETE for Admin role
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/deleteUserOrManager/**").hasRole("ADMIN")

                        .anyRequest().authenticated());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:5174", "http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }


}
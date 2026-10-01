package com.configserverllp.officerspro.profileservice.client;

import com.configserverllp.officerspro.profileservice.dto.request.CreateAuthUserRequest;
import com.configserverllp.officerspro.profileservice.dto.response.AuthUserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.context.annotation.Configuration;
import feign.RequestInterceptor;

@FeignClient(
    name = "auth-service", 
    url = "${auth.service.base-url}",
    configuration = AuthServiceClient.NoAuthConfiguration.class
)
public interface AuthServiceClient {

    @PostMapping(value = "/users", consumes = "application/json")
    AuthUserResponse createAuthUser(@RequestBody CreateAuthUserRequest request);
    
    // ✅ Custom configuration to DISABLE Keycloak auth for internal service calls
    @Configuration
    class NoAuthConfiguration {
        @org.springframework.context.annotation.Bean
        public RequestInterceptor requestInterceptor() {
            return template -> {
                // No authentication needed for internal service calls
            };
        }
    }
}


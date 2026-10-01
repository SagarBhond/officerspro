package com.configserver.officerspro.investigationandcasediaryservice.config;

import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class FeignClientConfig {

    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            log.error("❌ Feign client error - Method: {}, Status: {}, Reason: {}, URL: {}", 
                methodKey, response.status(), response.reason(), response.request().url());
            
            String errorMessage = String.format("Error calling %s: HTTP %d - %s", 
                methodKey, response.status(), response.reason());
            
            return new RuntimeException(errorMessage);
        };
    }

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // Add any headers you need for all Feign requests
            // For example, you might want to add an API key or authentication token
            // requestTemplate.header("Authorization", "Bearer " + getToken());
        };
    }
}

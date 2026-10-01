package com.configserver.officerspro.investigationandcasediaryservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class FeignAuthInterceptor {

    @Bean
    public RequestInterceptor requestTokenBearerInterceptor() {
        return template -> {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String token = request.getHeader("Authorization");

                if (token != null) {
                    template.header("Authorization", token);
                }
            }
        };
    }
}

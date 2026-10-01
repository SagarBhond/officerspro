package com.configserver.officerspro.courtcasemanagementservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI courtServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Court Case Management Service API")
                        .description("APIs for managing court cases, hearings, summons, judgments")
                        .version("1.0"));
    }
}

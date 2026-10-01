package com.configserver.officerspro.complainandfirservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

/**
 * OpenAPI/Swagger configuration for Complaint and FIR Service API.
 * Includes comprehensive documentation of error codes and API specifications.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Complaint and FIR Service API")
                        .version("1.0")
                        .description("""
                                API for managing complaints and FIR (First Information Report) registration.

                                ## Error Codes

                                The API uses standardized error codes for different types of failures:

                                | Error Code | Description |
                                |------------|-------------|
                                | **OFSCFS001** | Complaint not found |
                                | **OFSCFS006** | File processing failed |
                                | **OFSCFS009** | General service operation failed |

                                ## Error Response Format

                                All error responses follow a consistent JSON structure:

                                ```json
                                {
                                  "timestamp": "2024-01-01T12:00:00",
                                  "errorCode": "OFSCFS001",
                                  "message": "Complaint not found with ID: 123",
                                  "status": 404,
                                  "path": "/api/victim/statements/123"
                                }
                                ```

                                ## Authentication

                                This API uses basic authentication through officer credentials.
                                Include officer credentials in request headers for protected endpoints.
                                """)
                        .contact(new Contact()
                                .name("Police Department IT Team")
                                .email("it@police.gov.in"))
                        .license(new License()
                                .name("Internal Use Only")
                                .url("https://police.gov.in")))
                .servers(Arrays.asList(
                        new Server().url("http://localhost:8080").description("Development server"),
                        new Server().url("https://api.police.gov.in").description("Production server")
                ));
    }
}

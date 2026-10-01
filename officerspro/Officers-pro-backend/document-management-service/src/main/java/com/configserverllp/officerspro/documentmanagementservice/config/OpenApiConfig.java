package com.configserverllp.officerspro.documentmanagementservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI documentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Document Service API")
                        .description("Microservice for managing document metadata and linkages")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("CMS Team")
                                .email("support@cms.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}
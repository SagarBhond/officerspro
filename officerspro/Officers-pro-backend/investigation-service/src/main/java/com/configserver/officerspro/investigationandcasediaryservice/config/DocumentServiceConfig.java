package com.configserver.officerspro.investigationandcasediaryservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DocumentServiceConfig {
    @Value("${document.service.url}")
    private String documentServiceUrl;

    public String getDocumentServiceUrl() {
        return documentServiceUrl;
    }
}

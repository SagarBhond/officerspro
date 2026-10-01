package com.configserver.officerspro.helpsupportfeedbackservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class HelpSupportFeedbackServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelpSupportFeedbackServiceApplication.class, args);
        System.out.println("🚀 Help & Support Feedback Service Started Successfully on port 8094");
        System.out.println("📊 Service API: http://localhost:8094/api/support");
        System.out.println("📖 Swagger UI: http://localhost:8094/swagger-ui/index.html");
    }
}

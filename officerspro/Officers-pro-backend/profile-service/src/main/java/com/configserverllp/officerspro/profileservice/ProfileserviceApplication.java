package com.configserverllp.officerspro.profileservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.configserverllp.officerspro.profileservice.client")

@EnableJpaRepositories(basePackages = "com.configserverllp.officerspro.profileservice.repository")
@EnableDiscoveryClient
public class ProfileserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProfileserviceApplication.class, args);
		System.out.println("✅ ProfileService is running on http://localhost:8084/api/profile");
	}

}

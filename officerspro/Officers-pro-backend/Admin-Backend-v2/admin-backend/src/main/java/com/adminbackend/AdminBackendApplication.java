package com.adminbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class AdminBackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(AdminBackendApplication.class, args);
		System.out.println("Started");
	}
	@Primary
    @Bean
	public RestTemplate restTemplate(){
		return new RestTemplate();
	}

}

package com.cms.officerspro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class CrimeManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(CrimeManagementSystemApplication.class, args);
	}


	@Bean
    public RestTemplate	restTemplate(){
		 return new RestTemplate();
	}
}

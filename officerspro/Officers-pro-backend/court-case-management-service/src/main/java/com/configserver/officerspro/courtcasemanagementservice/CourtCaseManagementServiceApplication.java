package com.configserver.officerspro.courtcasemanagementservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class, ManagementWebSecurityAutoConfiguration.class})
@EnableFeignClients
public class CourtCaseManagementServiceApplication {

	public static void main(String[] args)
	{
		SpringApplication.run(CourtCaseManagementServiceApplication.class, args);
		System.out.println("Started");
	}

}

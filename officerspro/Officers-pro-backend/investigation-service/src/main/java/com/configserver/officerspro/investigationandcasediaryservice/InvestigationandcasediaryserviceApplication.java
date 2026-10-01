package com.configserver.officerspro.investigationandcasediaryservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
@EnableJpaRepositories(basePackages = "com.configserver.officerspro.investigationandcasediaryservice.repository")
public class InvestigationandcasediaryserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(InvestigationandcasediaryserviceApplication.class, args);
        System.out.println("Investigation and Case Diary Service started !!");
	}

}

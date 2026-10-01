package com.configserverllp.officerspro.subscriptionpaymentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SubscriptionpaymentserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SubscriptionpaymentserviceApplication.class, args);
	}

}

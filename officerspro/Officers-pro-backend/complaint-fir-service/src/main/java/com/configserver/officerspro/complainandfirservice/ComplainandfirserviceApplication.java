package com.configserver.officerspro.complainandfirservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class ComplainandfirserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComplainandfirserviceApplication.class, args);
        System.out.println("App started !!");
    }
}

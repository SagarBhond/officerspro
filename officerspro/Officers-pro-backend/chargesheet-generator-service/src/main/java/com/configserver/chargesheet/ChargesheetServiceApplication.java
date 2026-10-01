package com.configserver.chargesheet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication()
@EnableFeignClients(basePackages = "com.configserver.chargesheet.feign")
public class ChargesheetServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChargesheetServiceApplication.class, args);
    }
}

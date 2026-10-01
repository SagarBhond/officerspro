package com.configserverllp.api_gateway.controller;

import com.configserverllp.api_gateway.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class FallbackController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/fallback")
    public Mono<String> fallback() {

        emailService.sendServiceDownAlert("Complaint Service");

        return Mono.just("Service is down, fallback response! An alert mail has been sent to arti.hemantj@gmail.com.");
    }
}

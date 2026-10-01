package com.configserverllp.api_gateway.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendServiceDownAlert(String serviceName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("arti.hemantj@gmail.com");
        message.setSubject("Service Down Alert: " + serviceName);
        message.setText("Hello User,\n\nThe service '" + serviceName + "' is currently DOWN.\nPlease check it.\n\nRegards,\nAPI Gateway");
        mailSender.send(message);
    }
}

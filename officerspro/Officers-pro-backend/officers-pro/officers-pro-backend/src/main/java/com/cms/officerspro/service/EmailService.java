package com.cms.officerspro.service;

import com.cms.officerspro.entity.KeycloakUserRegistrationRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromMail;

    @Value("${email.subject}")
    private String subject;

    @Value("${email.htmlContent}")
    private String htmlContentTemplate;

    @Autowired
    private JavaMailSender emailSender;

    public void sendEmail(KeycloakUserRegistrationRequest user) {
        MimeMessage mimeMessage = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
        try {
            helper.setFrom(fromMail);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            String htmlContent = String.format(htmlContentTemplate, user.getEmail(), user.getPassword());
            helper.setText(htmlContent, true);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + user.getEmail(), e);
        }
        emailSender.send(mimeMessage);
    }
}

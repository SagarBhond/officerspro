package com.configserverllp.officerspro.subscriptionpaymentservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username}")
    private String fromMail;

    @Autowired
    private JavaMailSender emailSender;

    public void sendSubscriptionConfirmation(String toEmail, String officerName, String planType, int days) {
        MimeMessage mimeMessage = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
        try {
            helper.setFrom(fromMail);
            helper.setTo(toEmail);
            helper.setSubject("Subscription Plan Activated");

            String htmlContent = """
                <html>
                <body>
                    <h3>Hello %s,</h3>
                    <p>Your <strong>%s</strong> subscription has been successfully activated.</p>
                    <p>You now have access for the next <strong>%d</strong> days.</p>
                    <br>
                    <p>Thank you,<br/>Team OfficersPro</p>
                </body>
                </html>
            """.formatted(officerName, planType, days);

            helper.setText(htmlContent, true);
            emailSender.send(mimeMessage);
            log.info("✅ Subscription confirmation email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("❌ Failed to send subscription confirmation email to: {} - {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send subscription confirmation email to " + toEmail, e);
        }
    }
}

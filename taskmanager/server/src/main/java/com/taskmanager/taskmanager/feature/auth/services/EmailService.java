package com.taskmanager.taskmanager.feature.auth.services;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String token, String baseUrl) {
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String verificationUrl = normalizedBaseUrl + "/api/users/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verify Your Email - TaskManager");
        message.setText("Click the link below to verify your email:\n\n" + verificationUrl + "\n\nLink expires in 24 hours.");

        mailSender.send(message);
    }

    public void sendWelcomeEmail(String to, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to TaskManager!");
        message.setText("Hi " + name + ",\n\nYour email has been verified. You can now log in to TaskManager.");

        mailSender.send(message);
    }
}

package OnBoard_HR.AI.HR.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    private static final String FROM_EMAIL = "batchusaimanoj@gmail.com";
    private static final String FROM_NAME = "Lloyds Technology Center HR";

    public void sendOnboardingEmail(String candidateEmail, String candidateName) throws MessagingException, UnsupportedEncodingException {
        try {
            logger.info("Sending onboarding email to: {} for candidate: {}", candidateEmail, candidateName);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set email details with display name
            helper.setFrom(new InternetAddress(FROM_EMAIL, FROM_NAME));
            helper.setTo(candidateEmail);
            helper.setSubject(" Congratulations! Welcome to Lloyds Technology Center - Onboarding Process Started");

            // Create Thymeleaf context
            Context context = new Context();
            context.setVariable("candidateName", candidateName);

            // Process the template
            logger.debug("Processing email template for candidate: {}", candidateName);
            String htmlContent = templateEngine.process("onboarding-email", context);

            // Add plain text alternative
            String plainText = "Congratulations! You have cleared the interview rounds. We will start your onboarding process soon. Please login at http://localhost:5173/";
            helper.setText(plainText, htmlContent);

            // Send the email
            logger.debug("Sending email to: {}", candidateEmail);
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", candidateEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send email to: {} for candidate: {}", candidateEmail, candidateName, e);
            throw e;
        }
    }

    public void sendOnboardingEmailWithDetails(String candidateEmail, String candidateName, String position, String department) throws MessagingException, UnsupportedEncodingException {
        try {
            logger.info("Sending onboarding email with details to: {} for candidate: {} ({} - {})", 
                       candidateEmail, candidateName, position, department);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set email details with display name
            helper.setFrom(new InternetAddress(FROM_EMAIL, FROM_NAME));
            helper.setTo(candidateEmail);
            helper.setSubject(" Congratulations! Welcome to Lloyds Technology Center - Onboarding Process Started");

            // Create Thymeleaf context
            Context context = new Context();
            context.setVariable("candidateName", candidateName);
            context.setVariable("position", position);
            context.setVariable("department", department);

            // Process the template
            logger.debug("Processing email template for candidate: {} ({} - {})", candidateName, position, department);
            String htmlContent = templateEngine.process("onboarding-email", context);

            // Add plain text alternative
            String plainText = String.format(
                "Congratulations %s! You have cleared the interview rounds for %s in %s. We will start your onboarding process soon. Please login at http://localhost:5173/",
                candidateName, position, department
            );
            helper.setText(plainText, htmlContent);

            // Send the email
            logger.debug("Sending email to: {}", candidateEmail);
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", candidateEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send email to: {} for candidate: {} ({} - {})", 
                        candidateEmail, candidateName, position, department, e);
            throw e;
        }
    }
} 
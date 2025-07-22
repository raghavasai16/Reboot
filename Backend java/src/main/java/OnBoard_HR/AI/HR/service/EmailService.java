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


            helper.setFrom(new InternetAddress(FROM_EMAIL, FROM_NAME));
            helper.setTo(candidateEmail);
            helper.setSubject(" Congratulations! Welcome to Lloyds Technology Center - Onboarding Process Started");


            Context context = new Context();
            context.setVariable("candidateName", candidateName);
            context.setVariable("position", position);
            context.setVariable("department", department);


            logger.debug("Processing email template for candidate: {} ({} - {})", candidateName, position, department);
            String htmlContent = templateEngine.process("onboarding-email", context);

            String plainText = String.format(
                "Congratulations %s! You have cleared the interview rounds for %s in %s. We will start your onboarding process soon. Please login at http://localhost:5173/",
                candidateName, position, department
            );
            helper.setText(plainText, htmlContent);


            logger.debug("Sending email to: {}", candidateEmail);
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", candidateEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send email to: {} for candidate: {} ({} - {})", 
                        candidateEmail, candidateName, position, department, e);
            throw e;
        }
    }

    public void sendStepCompletionEmail(String candidateEmail, String step) throws MessagingException, UnsupportedEncodingException {
        try {
            logger.info("Sending step completion email to: {} for step: {}", candidateEmail, step);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = getMimeMessageHelper(candidateEmail, step, message);

            Context context = new Context();
            context.setVariable("step", step.substring(0,1).toUpperCase()+step.substring(1));
            String name[]=candidateEmail.split("@");
            context.setVariable("name",name[0].toUpperCase());
            String htmlContent = templateEngine.process("step-completion-email", context);
            String plainText = "Congratulations! You have successfully completed the " + step + " step in your onboarding process.";
            helper.setText(plainText, htmlContent);
            mailSender.send(message);
            logger.info("Step completion email sent successfully to: {}", candidateEmail);

        } catch (Exception e) {
            logger.error("Failed to send step completion email to: {} for step: {}", candidateEmail, step, e);
            throw e;
        }
    }

    private static MimeMessageHelper getMimeMessageHelper(String candidateEmail, String step, MimeMessage message) throws MessagingException, UnsupportedEncodingException {
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(new InternetAddress(FROM_EMAIL, FROM_NAME));
        helper.setCc(new String[] {
                "saigopal771@gmail.com",
                "Tejab654@gmail.com",
                "priiyankasahu@gmail.com",
                "madhusri42002@gmail.com"
        });

        helper.setTo(candidateEmail);
        helper.setSubject("Onboarding Step Completed: " + step.substring(0,1).toUpperCase()+ step.substring(1));
        return helper;
    }
} 
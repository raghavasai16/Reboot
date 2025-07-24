package OnBoard_HR.AI.HR;

import OnBoard_HR.AI.HR.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import static org.mockito.Mockito.*;

class EmailServiceTest {
    @Mock
    private JavaMailSender mailSender;
    @Mock
    private TemplateEngine templateEngine;
    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendOnboardingEmail() throws Exception {
        // This test will just verify that the method can be called without exceptions when dependencies are mocked
        doNothing().when(mailSender).send((MimeMessage) any());
        when(templateEngine.process(anyString(), any())).thenReturn("body");
        emailService.sendOnboardingEmail("test@example.com", "Test User");
        verify(mailSender, atLeastOnce()).send((MimeMessage) any());
    }
} 
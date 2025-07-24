package OnBoard_HR.AI.HR;

import OnBoard_HR.AI.HR.controller.OnboardingController;
import OnBoard_HR.AI.HR.dto.CandidateRequest;
import OnBoard_HR.AI.HR.dto.StepCompletionRequest;
import OnBoard_HR.AI.HR.entity.Candidate;
import OnBoard_HR.AI.HR.entity.OnboardingStep;
import OnBoard_HR.AI.HR.repository.CandidateRepository;
import OnBoard_HR.AI.HR.repository.OnboardingStepRepository;
import OnBoard_HR.AI.HR.service.EmailService;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OnboardingControllerTest {
    @Mock
    private OnboardingStepRepository onboardingStepRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private CandidateRepository candidateRepository;
    @InjectMocks
    private OnboardingController onboardingController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetSteps() {
        when(onboardingStepRepository.findByCandidateEmail("test@example.com")).thenReturn(List.of());
        ResponseEntity<List<OnboardingStep>> resp = onboardingController.getSteps("test@example.com");
        assertNotNull(resp.getBody());
        assertEquals(200, resp.getStatusCodeValue());
    }

    @Test
    void testAddCandidate() throws MessagingException, UnsupportedEncodingException {
        CandidateRequest req = new CandidateRequest();
        req.setEmail("test@example.com");
        doNothing().when(emailService).sendOnboardingEmail(anyString(), anyString());
        ResponseEntity<String> resp = onboardingController.addCandidate(req);
        assertEquals(200, resp.getStatusCodeValue());
    }

    @Test
    void testStepCompleted() {
        StepCompletionRequest req = new StepCompletionRequest();
        req.setEmail("1");
        req.setStep("forms");
        Candidate candidate = new Candidate();
        when(candidateRepository.findById(1L)).thenReturn(java.util.Optional.of(candidate));
        ResponseEntity<String> resp = onboardingController.stepCompleted(req);
        assertEquals(200, resp.getStatusCodeValue());
    }
} 
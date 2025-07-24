package OnBoard_HR.AI.HR;

import OnBoard_HR.AI.HR.controller.CandidateController;
import OnBoard_HR.AI.HR.dto.CandidateRequest;
import OnBoard_HR.AI.HR.entity.Candidate;
import OnBoard_HR.AI.HR.repository.CandidateRepository;
import OnBoard_HR.AI.HR.repository.OnboardingStepRepository;
import OnBoard_HR.AI.HR.repository.UserRepository;
import OnBoard_HR.AI.HR.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CandidateControllerTest {
    @Mock
    private EmailService emailService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OnboardingStepRepository onboardingStepRepository;
    @Mock
    private CandidateRepository candidateRepository;
    @InjectMocks
    private CandidateController candidateController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAddCandidateMissingEmail() {
        CandidateRequest req = new CandidateRequest();
        req.setFirstName("John");
        req.setEmail("");
        ResponseEntity<Map<String, Object>> resp = candidateController.addCandidate(req);
        assertFalse((Boolean) resp.getBody().get("success"));
        assertEquals(400, resp.getStatusCodeValue());
    }

    @Test
    void testAddCandidateSuccess() {
        CandidateRequest req = new CandidateRequest();
        req.setFirstName("John");
        req.setLastName("Doe");
        req.setEmail("john@example.com");
        ResponseEntity<Map<String, Object>> resp = candidateController.addCandidate(req);
        assertTrue(resp.getBody().containsKey("success"));
    }

    @Test
    void testHealthCheck() {
        ResponseEntity<Map<String, String>> resp = candidateController.healthCheck();
        assertEquals("UP", resp.getBody().get("status"));
        assertEquals(200, resp.getStatusCodeValue());
    }
} 
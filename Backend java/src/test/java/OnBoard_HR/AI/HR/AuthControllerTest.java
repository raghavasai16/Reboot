package OnBoard_HR.AI.HR;

import OnBoard_HR.AI.HR.controller.AuthController;
import OnBoard_HR.AI.HR.entity.Candidate;
import OnBoard_HR.AI.HR.entity.User;
import OnBoard_HR.AI.HR.repository.CandidateRepository;
import OnBoard_HR.AI.HR.repository.UserRepository;
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

class AuthControllerTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private CandidateRepository candidateRepository;
    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLoginSuccessCandidate() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("pass");
        user.setRole("candidate");
        Candidate candidate = new Candidate();
        candidate.setId(1L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);
        when(candidateRepository.findByEmail("test@example.com")).thenReturn(candidate);
        Map<String, String> req = new HashMap<>();
        req.put("email", "test@example.com");
        req.put("password", "pass");
        ResponseEntity<Map<String, Object>> resp = authController.login(req);
        assertTrue((Boolean) resp.getBody().get("success"));
        assertEquals("candidate", resp.getBody().get("role"));
        assertEquals(1L, resp.getBody().get("id"));
    }

    @Test
    void testLoginInvalidPassword() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("pass");
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);
        Map<String, String> req = new HashMap<>();
        req.put("email", "test@example.com");
        req.put("password", "wrong");
        ResponseEntity<Map<String, Object>> resp = authController.login(req);
        assertFalse((Boolean) resp.getBody().get("success"));
        assertEquals(401, resp.getStatusCodeValue());
    }

    @Test
    void testLoginUserNotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(null);
        Map<String, String> req = new HashMap<>();
        req.put("email", "notfound@example.com");
        req.put("password", "pass");
        ResponseEntity<Map<String, Object>> resp = authController.login(req);
        assertFalse((Boolean) resp.getBody().get("success"));
        assertEquals(401, resp.getStatusCodeValue());
    }
} 
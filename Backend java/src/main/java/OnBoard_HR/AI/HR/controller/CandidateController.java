package OnBoard_HR.AI.HR.controller;

import OnBoard_HR.AI.HR.dto.CandidateRequest;
import OnBoard_HR.AI.HR.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import java.util.HashMap;
import java.util.Map;
import OnBoard_HR.AI.HR.entity.User;
import OnBoard_HR.AI.HR.repository.UserRepository;
import OnBoard_HR.AI.HR.entity.OnboardingStep;
import OnBoard_HR.AI.HR.repository.OnboardingStepRepository;
import OnBoard_HR.AI.HR.entity.Candidate;
import OnBoard_HR.AI.HR.repository.CandidateRepository;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    private static final Logger logger = LoggerFactory.getLogger(CandidateController.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OnboardingStepRepository onboardingStepRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    RestTemplate restTemplate;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addCandidate(@RequestBody CandidateRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        logger.info("Received candidate request: {}", request);
        
        try {
            // Validate request
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                logger.warn("Email validation failed: email is null or empty");
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                logger.warn("First name validation failed: firstName is null or empty");
                response.put("success", false);
                response.put("message", "First name is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Get candidate name
            String candidateName = request.getFullName();
            if (candidateName.trim().isEmpty()) {
                candidateName = request.getFirstName();
            }

            logger.info("Processing candidate: {} with email: {}", candidateName, request.getEmail());

            // Send onboarding email
            try {
                if (request.getPosition() != null && request.getDepartment() != null) {
                    logger.info("Sending email with details for: {} ({} - {})", candidateName, request.getPosition(), request.getDepartment());
                    String url = "http://localhost:8081/api/notifications/send/onboarding/detailed/{email}/{name}/{position}/{department}";
                    Map<String, String> uriParams = Map.of("email", request.getEmail(),
                            "name", candidateName, "position", request.getPosition(), "department", request.getDepartment());
                    HttpHeaders headers = new HttpHeaders();
                    HttpEntity<Void> httpEntity = new HttpEntity<>(headers);

                    ResponseEntity<String> responseEntity = restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            httpEntity,
                            String.class,
                            uriParams
                    );
//                    emailService.sendOnboardingEmailWithDetails(
//                        request.getEmail(),
//                        candidateName,
//                        request.getPosition(),
//                        request.getDepartment()
//                    );
                } else {
                    logger.info("Sending basic email for: {}", candidateName);
                    String url = "http://localhost:8081/api/notifications/send/onboarding/{email}/{name}";
                    Map<String, String> uriParams = Map.of("email", request.getEmail(), "name", candidateName);
                    HttpHeaders headers = new HttpHeaders();
                    HttpEntity<Void> httpEntity = new HttpEntity<>(headers);

                    ResponseEntity<String> responseEntity = restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            httpEntity,
                            String.class,
                            uriParams
                    );
//                    emailService.sendOnboardingEmail(, candidateName);
                }
            } catch (Exception e) {
                logger.error("Email sending failed for: {} with email: {}", candidateName, request.getEmail(), e);
                response.put("success", false);
                response.put("message", "Failed to send email: " + e.getMessage());
                return ResponseEntity.status(500).body(response);
            }

            // Save user to DB
            if (!userRepository.existsByEmail(request.getEmail())) {
                User user = new User();
                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setEmail(request.getEmail());
                user.setPosition(request.getPosition());
                user.setDepartment(request.getDepartment());
                user.setRole("candidate");
                user.setPassword((request.getFirstName() != null ? request.getFirstName() : "") + (request.getLastName() != null ? request.getLastName() : ""));
                userRepository.save(user);
                // Also save to Candidate table
                Candidate candidate = new Candidate();
                candidate.setFirstName(request.getFirstName());
                candidate.setLastName(request.getLastName());
                candidate.setEmail(request.getEmail());
                candidate.setPosition(request.getPosition());
                candidate.setDepartment(request.getDepartment());
                candidate.setStartDate(request.getStartDate() != null ? java.time.LocalDate.parse(request.getStartDate()) : null);
                candidate.setStatus("pending");
                candidate.setProgress(request.getProgress() != null ? request.getProgress() : 0);
                candidate.setLastActivity(java.time.LocalDateTime.now());
                candidateRepository.save(candidate);
                Long candidateId = candidate.getId();
                // Initialize onboarding steps for the new candidate
                String[] stepIds = {"login"};
                String[] defaultStatuses = {"completed"};
                for (int i = 0; i < stepIds.length; i++) {
                    OnboardingStep step = new OnboardingStep();
                    step.setCandidateId(candidateId); // Set candidateId for robust linkage
                    step.setCandidateEmail(request.getEmail());
                    step.setStepId(stepIds[i]);
                    step.setStatus(defaultStatuses[i]);
                    step.setData(null);
                    step.setUpdatedAt(java.time.LocalDateTime.now());
                    onboardingStepRepository.save(step);
                }
            }


            // Prepare success response
            response.put("success", true);
            response.put("message", "Candidate added successfully and onboarding email sent!");
            response.put("candidateName", candidateName);
            response.put("email", request.getEmail());
            response.put("position", request.getPosition());
            response.put("department", request.getDepartment());
            response.put("role", "candidate");

            logger.info("Successfully processed candidate: {} with email: {}", candidateName, request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Unexpected error processing candidate request: {}", request, e);
            response.put("success", false);
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<?> updateCandidateProgress(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Candidate candidate = candidateRepository.findById(id).orElse(null);
            if (candidate == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Candidate not found"));
            }
            Integer progress = (Integer) payload.get("progress");
            String status = (String) payload.get("status");
            if (progress != null) candidate.setProgress(progress);
            if (status != null) candidate.setStatus(status);
            candidate.setLastActivity(java.time.LocalDateTime.now());
            candidateRepository.save(candidate);
            return ResponseEntity.ok(Map.of("success", true, "candidate", candidate));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        logger.info("Health check requested");
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Candidate API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getAllCandidates() {
        try {
            return ResponseEntity.ok(candidateRepository.findAll());
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch candidates: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testCandidate(@RequestBody CandidateRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        logger.info("Test candidate request received: {}", request);
        
        try {
            // Validate request
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "First name is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Get candidate name
            String candidateName = request.getFullName();
            if (candidateName.trim().isEmpty()) {
                candidateName = request.getFirstName();
            }

            // Prepare success response (without sending email)
            response.put("success", true);
            response.put("message", "Test successful! Backend is working correctly.");
            response.put("candidateName", candidateName);
            response.put("email", request.getEmail());
            response.put("position", request.getPosition());
            response.put("department", request.getDepartment());
            response.put("note", "Email sending was skipped for testing");

            logger.info("Test successful for candidate: {} with email: {}", candidateName, request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Test failed for request: {}", request, e);
            response.put("success", false);
            response.put("message", "Test failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 
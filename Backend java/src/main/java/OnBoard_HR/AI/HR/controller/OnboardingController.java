package OnBoard_HR.AI.HR.controller;

import OnBoard_HR.AI.HR.entity.OnboardingStep;
import OnBoard_HR.AI.HR.repository.OnboardingStepRepository;
import OnBoard_HR.AI.HR.dto.CandidateRequest;
import OnBoard_HR.AI.HR.dto.StepCompletionRequest;
import OnBoard_HR.AI.HR.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import OnBoard_HR.AI.HR.entity.Candidate;
import OnBoard_HR.AI.HR.repository.CandidateRepository;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingController {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingController.class);

    @Autowired
    private OnboardingStepRepository onboardingStepRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    RestTemplate restTemplate;

    // Get all onboarding steps for a candidate
    @GetMapping("/{candidateEmail}")
    public ResponseEntity<List<OnboardingStep>> getSteps(@PathVariable String candidateEmail) {
        List<OnboardingStep> steps = onboardingStepRepository.findByCandidateEmail(candidateEmail);
        // Keep only the latest record for each stepId
        Map<String, OnboardingStep> latestSteps = new HashMap<>();
        for (OnboardingStep step : steps) {
            String stepId = step.getStepId();
            if (!latestSteps.containsKey(stepId) || step.getUpdatedAt().isAfter(latestSteps.get(stepId).getUpdatedAt())) {
                latestSteps.put(stepId, step);
            }
        }
        return ResponseEntity.ok(new ArrayList<>(latestSteps.values()));
    }

    // Add new endpoint to get steps by candidateId
    @GetMapping("/by-id/{candidateId}")
    public ResponseEntity<List<OnboardingStep>> getStepsByCandidateId(@PathVariable Long candidateId) {
        List<OnboardingStep> steps = onboardingStepRepository.findByCandidateId(candidateId);
        // Map of stepId to latest step
        Map<String, OnboardingStep> latestSteps = new HashMap<>();
        for (OnboardingStep step : steps) {
            String stepId = step.getStepId();
            if (!latestSteps.containsKey(stepId) || step.getUpdatedAt().isAfter(latestSteps.get(stepId).getUpdatedAt())) {
                latestSteps.put(stepId, step);
            }
        }
        // Define the full list of step IDs and titles (should match frontend)
        String[][] allSteps = {
            {"login", "Login & Password Reset"},
            {"forms", "Adaptive Forms"},
            {"documents", "Document Upload"},
            {"verification", "Cross Validation"},
            {"hr-review", "HR Review"},
            {"offer", "Offer Generation"},
            {"bgv", "Background Verification"},
            {"pre-onboarding", "Pre-Onboarding"},
            {"gamification", "Gamified Induction"}
        };
        List<OnboardingStep> result = new ArrayList<>();
        for (String[] stepInfo : allSteps) {
            String stepId = stepInfo[0];
            String title = stepInfo[1];
            if (latestSteps.containsKey(stepId)) {
                result.add(latestSteps.get(stepId));
            } else {
                OnboardingStep pendingStep = new OnboardingStep();
                pendingStep.setCandidateId(candidateId);
                pendingStep.setStepId(stepId);
                pendingStep.setStatus("pending");
                pendingStep.setCandidateEmail(steps.isEmpty() ? null : steps.get(0).getCandidateEmail());
                pendingStep.setData(null);
                pendingStep.setUpdatedAt(java.time.LocalDateTime.now());
                result.add(pendingStep);
            }
        }
        return ResponseEntity.ok(result);
    }

    // Update or create a step for a candidate
    @PostMapping("/{candidateId}/step")
    public ResponseEntity<Map<String, Object>> updateStepById(
            @PathVariable Long candidateId,
            @RequestBody Map<String, Object> payload
    ) {
        String stepId = (String) payload.get("stepId");
        String status = (String) payload.get("status");
        String data = payload.get("data") != null ? payload.get("data").toString() : null;
        Map<String, Object> response = new HashMap<>();

        if (stepId == null || status == null) {
            response.put("success", false);
            response.put("message", "stepId and status are required");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if step exists
        Optional<OnboardingStep> existing = onboardingStepRepository.findByCandidateIdAndStepId(candidateId, stepId);
        OnboardingStep step;
        if (existing.isPresent()) {
            step = existing.get();
            step.setStatus(status);
            step.setData(data);
            step.setUpdatedAt(java.time.LocalDateTime.now());
        } else {
            step = new OnboardingStep();
            step.setCandidateId(candidateId);
            step.setStepId(stepId);
            step.setStatus(status);
            step.setData(data);
            step.setUpdatedAt(java.time.LocalDateTime.now());
            // Always set candidateEmail
            Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
            if (candidate != null) {
                step.setCandidateEmail(candidate.getEmail());
            } else {
                step.setCandidateEmail("unknown@example.com");
            }
        }
        onboardingStepRepository.save(step);

        // Update candidate progress after step update
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate != null) {
            // List of all required step IDs (should match frontend)
            String[] allStepIds = {
                "login", "forms", "documents", "verification", "hr-review",
                "offer", "bgv", "pre-onboarding", "gamification"
            };
            List<OnboardingStep> allSteps = onboardingStepRepository.findByCandidateId(candidateId);
            long completed = java.util.Arrays.stream(allStepIds)
                .filter(requiredStepId -> allSteps.stream()
                    .anyMatch(s -> requiredStepId.equals(s.getStepId()) && "completed".equalsIgnoreCase(s.getStatus())))
                .count();
            long total = allStepIds.length;
            if (total > 0) {
                int progress = (int) Math.round((completed * 100.0) / total);
                candidate.setProgress(progress);
                candidate.setLastActivity(java.time.LocalDateTime.now());
                candidateRepository.save(candidate);
            }
        }

        response.put("success", true);
        response.put("message", "Step updated successfully");
        return ResponseEntity.ok(response);
    }

    // Admin/manual force-complete endpoint
    @PostMapping("/{candidateEmail}/force-complete")
    public ResponseEntity<?> forceCompleteStep(
        @PathVariable String candidateEmail,
        @RequestParam String stepId
    ) {
        logger.info("Force completing step: candidateEmail={}, stepId={}", candidateEmail, stepId);
        Optional<OnboardingStep> existing = onboardingStepRepository.findByCandidateEmailAndStepId(candidateEmail, stepId);
        if (existing.isPresent()) {
            OnboardingStep step = existing.get();
            step.setStatus("completed");
            step.setUpdatedAt(java.time.LocalDateTime.now());
            onboardingStepRepository.save(step);
            return ResponseEntity.ok("Step forced to completed");
        }
        return ResponseEntity.badRequest().body("Step not found");
    }

    // Get recent activities for a candidate (sorted by updatedAt desc, limit 10)
    @GetMapping("/{candidateEmail}/activities")
    public ResponseEntity<List<OnboardingStep>> getRecentActivities(@PathVariable String candidateEmail) {
        List<OnboardingStep> steps = onboardingStepRepository.findByCandidateEmail(candidateEmail);
        steps.sort((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()));
        return ResponseEntity.ok(steps.stream().limit(10).toList());
    }

    // Get recent activities for all candidates (for HR, sorted by updatedAt desc, limit 20)
    @GetMapping("/activities/all")
    public ResponseEntity<List<OnboardingStep>> getAllRecentActivities() {
        List<OnboardingStep> steps = onboardingStepRepository.findAll();
        steps.sort((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()));
        return ResponseEntity.ok(steps.stream().limit(20).toList());
    }

    @PostMapping("/add")
    public ResponseEntity<String> addCandidate(@RequestBody CandidateRequest candidateRequest) {
        try {
            emailService.sendOnboardingEmail(candidateRequest.getEmail(), candidateRequest.getLastName()+","+candidateRequest.getFirstName());
            return new ResponseEntity<>("Onboarding email sent successfully.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to send onboarding email.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/step-completed")
    public ResponseEntity<String> stepCompleted(@RequestBody StepCompletionRequest request) {
        try {
            String email = request.getEmail();
            String step = request.getStep();
            if(step.equalsIgnoreCase("forms"))
            {
                Long candidateId = Long.parseLong(email);
                Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
                candidate.setStatus("active");
                candidateRepository.save(candidate);
            }
            if(step.equalsIgnoreCase("gamification"))
            {
                Long candidateId = Long.parseLong(email);
                Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
                candidate.setStatus("completed");
                candidateRepository.save(candidate);
            }

            // If the email is actually a numeric ID, look up the real email
            if (email != null && email.matches("^\\d+$")) {
                Long candidateId = Long.parseLong(email);
                Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
                if (candidate != null) {
                    email = candidate.getEmail();
                } else {
                    return new ResponseEntity<>("Failed to send step completion email: candidate not found.", HttpStatus.BAD_REQUEST);
                }
            }
            String url = "http://localhost:8081/api/notifications/send/step-completion/{email}/{step}";
            Map<String, String> uriParams = Map.of("email", email, "step", step);
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> httpEntity = new HttpEntity<>(headers);

            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    httpEntity,
                    String.class,
                    uriParams
            );
//            emailService.sendStepCompletionEmail(email, step);
            return new ResponseEntity<>("Step completion email sent successfully.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to send step completion email.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
} 
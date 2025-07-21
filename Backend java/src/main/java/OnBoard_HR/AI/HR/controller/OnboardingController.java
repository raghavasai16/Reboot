package OnBoard_HR.AI.HR.controller;

import OnBoard_HR.AI.HR.entity.OnboardingStep;
import OnBoard_HR.AI.HR.repository.OnboardingStepRepository;
import OnBoard_HR.AI.HR.dto.CandidateRequest;
import OnBoard_HR.AI.HR.dto.StepCompletionRequest;
import OnBoard_HR.AI.HR.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingController {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingController.class);

    @Autowired
    private OnboardingStepRepository onboardingStepRepository;

    @Autowired
    private EmailService emailService;

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

    // Update or create a step for a candidate
    @PostMapping("/{candidateEmail}/step")
    public ResponseEntity<Map<String, Object>> updateStep(
            @PathVariable String candidateEmail,
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-User-Role", required = false) String userRole // Expecting frontend to send this header
    ) {
        String stepId = (String) payload.get("stepId");
        String status = (String) payload.get("status");
        String data = payload.get("data") != null ? payload.get("data").toString() : null;
        Map<String, Object> response = new HashMap<>();

        logger.info("Inserting onboarding step: candidateEmail={}, stepId={}, status={}, userRole={}", candidateEmail, stepId, status, userRole);

        if (stepId == null || status == null) {
            response.put("success", false);
            response.put("message", "stepId and status are required");
            return ResponseEntity.badRequest().body(response);
        }

        // Always insert a new record for each step completion
        OnboardingStep step = new OnboardingStep();
        step.setCandidateEmail(candidateEmail);
        step.setStepId(stepId);
        step.setStatus(status);
        step.setData(data);
        step.setUpdatedAt(java.time.LocalDateTime.now());
        onboardingStepRepository.save(step);

        response.put("success", true);
        response.put("message", "Step inserted successfully");
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
            emailService.sendStepCompletionEmail(request.getEmail(), request.getStep());
            return new ResponseEntity<>("Step completion email sent successfully.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to send step completion email.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
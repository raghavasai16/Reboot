package OnBoard_HR.AI.HR.repository;

import OnBoard_HR.AI.HR.entity.OnboardingStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OnboardingStepRepository extends JpaRepository<OnboardingStep, Integer> {
    List<OnboardingStep> findByCandidateEmail(String candidateEmail);
    Optional<OnboardingStep> findByCandidateEmailAndStepId(String candidateEmail, String stepId);
} 
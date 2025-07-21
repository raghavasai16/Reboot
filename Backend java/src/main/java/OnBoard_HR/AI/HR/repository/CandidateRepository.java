package OnBoard_HR.AI.HR.repository;

import OnBoard_HR.AI.HR.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Candidate findByEmail(String email);
} 
package OnBoard_HR.AI.HR.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_steps", uniqueConstraints = @UniqueConstraint(columnNames = {"candidate_email", "step_id"}))
public class OnboardingStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "candidate_email", nullable = false)
    private String candidateEmail;

    @Column(name = "candidate_id")
    private Long candidateId;

    @Column(name = "step_id", nullable = false)
    private String stepId;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String data;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
    public String getStepId() { return stepId; }
    public void setStepId(String stepId) { this.stepId = stepId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 
package OnBoard_HR.AI.HR.repository;

import OnBoard_HR.AI.HR.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCandidateId(Long candidateId);
} 
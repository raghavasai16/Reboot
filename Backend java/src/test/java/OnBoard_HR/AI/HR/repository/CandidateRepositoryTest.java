package OnBoard_HR.AI.HR.repository;

import OnBoard_HR.AI.HR.entity.Candidate;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class CandidateRepositoryTest {
    @Test
    void testFindByEmail() {
        CandidateRepository repo = mock(CandidateRepository.class);
        Candidate c = new Candidate();
        when(repo.findByEmail("john@example.com")).thenReturn(c);
        assertEquals(c, repo.findByEmail("john@example.com"));
    }
} 
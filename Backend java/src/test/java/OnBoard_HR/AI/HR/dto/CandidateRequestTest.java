package OnBoard_HR.AI.HR.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CandidateRequestTest {
    @Test
    void testGettersAndSetters() {
        CandidateRequest c = new CandidateRequest();
        c.setFirstName("John");
        c.setLastName("Doe");
        c.setEmail("john@example.com");
        c.setPosition("Dev");
        c.setDepartment("IT");
        c.setStartDate("2024-01-01");
        c.setProgress(80);
        assertEquals("John", c.getFirstName());
        assertEquals("Doe", c.getLastName());
        assertEquals("john@example.com", c.getEmail());
        assertEquals("Dev", c.getPosition());
        assertEquals("IT", c.getDepartment());
        assertEquals("2024-01-01", c.getStartDate());
        assertEquals(80, c.getProgress());
    }
} 
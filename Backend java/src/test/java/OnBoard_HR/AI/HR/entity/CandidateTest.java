package OnBoard_HR.AI.HR.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class CandidateTest {
    @Test
    void testGettersAndSetters() {
        Candidate c = new Candidate();
        c.setId(1L);
        c.setFirstName("John");
        c.setLastName("Doe");
        c.setEmail("john@example.com");
        c.setPosition("Dev");
        c.setDepartment("IT");
        LocalDate date = LocalDate.now();
        c.setStartDate(date);
        c.setStatus("active");
        LocalDateTime now = LocalDateTime.now();
        c.setLastActivity(now);
        c.setProgress(50);
        assertEquals(1L, c.getId());
        assertEquals("John", c.getFirstName());
        assertEquals("Doe", c.getLastName());
        assertEquals("john@example.com", c.getEmail());
        assertEquals("Dev", c.getPosition());
        assertEquals("IT", c.getDepartment());
        assertEquals(date, c.getStartDate());
        assertEquals("active", c.getStatus());
        assertEquals(now, c.getLastActivity());
        assertEquals(50, c.getProgress());
    }
} 
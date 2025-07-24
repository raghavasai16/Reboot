package OnBoard_HR.AI.HR.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {
    @Test
    void testGettersAndSetters() {
        User u = new User();
        u.setId(1);
        u.setFirstName("Jane");
        u.setLastName("Smith");
        u.setEmail("jane@example.com");
        u.setPosition("HR");
        u.setDepartment("Admin");
        u.setRole("hr");
        u.setPassword("pass");
        LocalDateTime now = LocalDateTime.now();
        u.setCreatedAt(now);
        assertEquals(1, u.getId());
        assertEquals("Jane", u.getFirstName());
        assertEquals("Smith", u.getLastName());
        assertEquals("jane@example.com", u.getEmail());
        assertEquals("HR", u.getPosition());
        assertEquals("Admin", u.getDepartment());
        assertEquals("hr", u.getRole());
        assertEquals("pass", u.getPassword());
        assertEquals(now, u.getCreatedAt());
    }
} 
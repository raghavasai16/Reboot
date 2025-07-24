package OnBoard_HR.AI.HR.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class NotificationTest {
    @Test
    void testGettersAndSetters() {
        Notification n = new Notification();
        n.setId(1L);
        n.setUserEmail("user@example.com");
        n.setType("info");
        n.setTitle("Title");
        n.setMessage("Message");
        n.setRead(true);
        LocalDateTime now = LocalDateTime.now();
        n.setCreatedAt(now);
        assertEquals(1L, n.getId());
        assertEquals("user@example.com", n.getUserEmail());
        assertEquals("info", n.getType());
        assertEquals("Title", n.getTitle());
        assertEquals("Message", n.getMessage());
        assertTrue(n.isRead());
        assertEquals(now, n.getCreatedAt());
    }
} 
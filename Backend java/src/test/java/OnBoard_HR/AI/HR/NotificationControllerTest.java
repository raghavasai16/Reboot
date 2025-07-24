package OnBoard_HR.AI.HR;

import OnBoard_HR.AI.HR.controller.NotificationController;
import OnBoard_HR.AI.HR.entity.Notification;
import OnBoard_HR.AI.HR.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificationControllerTest {
    @Mock
    private NotificationRepository notificationRepository;
    @InjectMocks
    private NotificationController notificationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetNotifications() {
        Notification n = new Notification();
        n.setUserEmail("user@example.com");
        when(notificationRepository.findByUserEmailOrderByCreatedAtDesc("user@example.com")).thenReturn(List.of(n));
        ResponseEntity<List<Notification>> resp = notificationController.getNotifications("user@example.com");
        assertEquals(1, resp.getBody().size());
    }

    @Test
    void testCreateNotification() {
        Notification n = new Notification();
        when(notificationRepository.save(any())).thenReturn(n);
        ResponseEntity<Notification> resp = notificationController.createNotification(n);
        assertEquals(n, resp.getBody());
    }

    @Test
    void testMarkAsRead() {
        Notification n = new Notification();
        n.setRead(false);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any())).thenReturn(n);
        ResponseEntity<Notification> resp = notificationController.markAsRead(1L);
        assertTrue(resp.getBody().isRead());
    }
} 
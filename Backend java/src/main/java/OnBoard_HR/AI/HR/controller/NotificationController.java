package OnBoard_HR.AI.HR.controller;

import OnBoard_HR.AI.HR.entity.Notification;
import OnBoard_HR.AI.HR.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    // Get all notifications for a user
    @GetMapping("/{userEmail}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String userEmail) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        return ResponseEntity.ok(notifications);
    }

    // Create a new notification
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }

    // Mark a notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
            return ResponseEntity.ok(notification);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
} 
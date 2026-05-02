package com.sliit.smartcampus.controller;

import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // GET /api/notifications - Get all my notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotifications(currentNotificationUserIds(authentication)));
    }

    // GET /api/notifications/unread - Get unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(currentNotificationUserIds(authentication)));
    }

    // GET /api/notifications/count - Get unread count
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(currentNotificationUserIds(authentication));
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // PUT/PATCH /api/notifications/{id}/read - Mark as read
    @RequestMapping(path = "/{id}/read", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> markAsRead(@PathVariable String id, Authentication authentication) {
        try {
            return ResponseEntity.ok(notificationService.markAsRead(id, currentNotificationUserIds(authentication)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT/PATCH /api/notifications/read-all - Mark all as read
    @RequestMapping(path = "/read-all", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(currentNotificationUserIds(authentication));
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // DELETE /api/notifications/{id} - Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id, Authentication authentication) {
        try {
            notificationService.deleteNotification(id, currentNotificationUserIds(authentication));
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private List<String> currentNotificationUserIds(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return List.of();
        }

        String principal = authentication.getName().trim();
        Set<String> userIds = new LinkedHashSet<>();
        userIds.add(principal);
        userRepository.findByEmail(principal).ifPresent(user -> {
            userIds.add(user.getEmail());
            userIds.add(user.getId());
        });
        return new ArrayList<>(userIds);
    }
}

package com.sliit.smartcampus.service;

import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.repository.NotificationRepository;
import com.sliit.smartcampus.service.NotificationService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Profile("!mock")
@RequiredArgsConstructor
public class MongoNotificationService implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<Notification> getUserNotifications(Collection<String> userIds) {
        Set<String> recipients = normalizeUserIds(userIds);
        if (recipients.isEmpty()) {
            return List.of();
        }
        return notificationRepository.findByUserIdInOrderByCreatedAtDesc(recipients);
    }

    @Override
    public List<Notification> getUnreadNotifications(Collection<String> userIds) {
        Set<String> recipients = normalizeUserIds(userIds);
        if (recipients.isEmpty()) {
            return List.of();
        }
        return notificationRepository.findByUserIdInAndReadFalse(recipients);
    }

    @Override
    public long getUnreadCount(Collection<String> userIds) {
        Set<String> recipients = normalizeUserIds(userIds);
        if (recipients.isEmpty()) {
            return 0;
        }
        return notificationRepository.countByUserIdInAndReadFalse(recipients);
    }

    @Override
    public Notification markAsRead(String notificationId, Collection<String> userIds) {
        Set<String> recipients = normalizeUserIds(userIds);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        requireOwner(notification, recipients);

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Collection<String> userIds) {
        Set<String> recipients = normalizeUserIds(userIds);
        if (recipients.isEmpty()) {
            return;
        }
        List<Notification> unread = notificationRepository.findByUserIdInAndReadFalse(recipients);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public Notification createNotification(String userId, String title, String message, String type) {
        Notification notification = new Notification(userId, title, message, type);
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(String notificationId, Collection<String> userIds) {
        Set<String> recipients = normalizeUserIds(userIds);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        requireOwner(notification, recipients);
        notificationRepository.deleteById(notificationId);
    }

    private Set<String> normalizeUserIds(Collection<String> userIds) {
        if (userIds == null) {
            return Set.of();
        }

        Set<String> normalized = new LinkedHashSet<>();
        for (String userId : userIds) {
            if (userId != null && !userId.isBlank()) {
                normalized.add(userId.trim());
            }
        }
        return normalized;
    }

    private void requireOwner(Notification notification, Set<String> userIds) {
        if (notification.getUserId() == null || !userIds.contains(notification.getUserId())) {
            throw new RuntimeException("Notification not found");
        }
    }
}

package com.sliit.smartcampus.service;

import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.service.NotificationService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
@Profile("mock")
public class MockNotificationService implements NotificationService {

    @Override
    public List<Notification> getUserNotifications(Collection<String> userIds) {
        return new ArrayList<>();
    }

    @Override
    public List<Notification> getUnreadNotifications(Collection<String> userIds) {
        return new ArrayList<>();
    }

    @Override
    public long getUnreadCount(Collection<String> userIds) {
        // Return 0 to prevent 500 errors during periodic polling in the mock environment
        return 0;
    }

    @Override
    public Notification markAsRead(String notificationId, Collection<String> userIds) {
        return null;
    }

    @Override
    public void markAllAsRead(Collection<String> userIds) {
        // Mock success
    }

    @Override
    public Notification createNotification(String userId, String title, String message, String type) {
        return new Notification(userId, title, message, type);
    }

    @Override
    public void deleteNotification(String notificationId, Collection<String> userIds) {
        // Mock success
    }
}

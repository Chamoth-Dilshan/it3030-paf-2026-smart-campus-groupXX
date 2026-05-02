package com.sliit.smartcampus.service;

import com.sliit.smartcampus.model.Notification;
import java.util.Collection;
import java.util.List;

public interface NotificationService {
    List<Notification> getUserNotifications(Collection<String> userIds);
    List<Notification> getUnreadNotifications(Collection<String> userIds);
    long getUnreadCount(Collection<String> userIds);
    Notification markAsRead(String notificationId, Collection<String> userIds);
    void markAllAsRead(Collection<String> userIds);
    Notification createNotification(String userId, String title, String message, String type);
    void deleteNotification(String notificationId, Collection<String> userIds);
}

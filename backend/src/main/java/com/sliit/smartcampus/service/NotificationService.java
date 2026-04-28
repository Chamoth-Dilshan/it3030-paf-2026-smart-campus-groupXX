package com.sliit.smartcampus.service;

import com.sliit.smartcampus.model.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getUserNotifications(String userId);
    List<Notification> getUnreadNotifications(String userId);
    long getUnreadCount(String userId);
    Notification markAsRead(String notificationId);
    void markAllAsRead(String userId);
    Notification createNotification(String userId, String title, String message, String type);
    void deleteNotification(String notificationId);
}
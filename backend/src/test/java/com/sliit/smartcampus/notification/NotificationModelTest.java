package com.sliit.smartcampus.notification;

import com.sliit.smartcampus.model.Notification;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

class NotificationModelTest {
    @Test
    void constructorCreatesUnreadNotificationWithTimestamp() {
        Notification notification = new Notification("user-1", "Booking update", "Approved", "BOOKING");

        assertEquals("user-1", notification.getUserId());
        assertEquals("Booking update", notification.getTitle());
        assertFalse(notification.isRead());
        assertNotNull(notification.getCreatedAt());
    }
}

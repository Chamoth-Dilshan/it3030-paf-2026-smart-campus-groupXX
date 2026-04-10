package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
}

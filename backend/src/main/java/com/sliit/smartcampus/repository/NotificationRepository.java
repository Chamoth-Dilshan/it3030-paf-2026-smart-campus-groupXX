package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
//kasun akalanka
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndReadFalse(String userId);
    long countByUserIdAndReadFalse(String userId);
}
//kasun akalanka
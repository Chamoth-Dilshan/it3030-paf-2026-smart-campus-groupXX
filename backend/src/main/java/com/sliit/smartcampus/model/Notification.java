package com.sliit.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    // User-facing alert placeholder for reminders and workflow updates.
    private String userId;
    private String title;
    private String message;
    private boolean read;
}

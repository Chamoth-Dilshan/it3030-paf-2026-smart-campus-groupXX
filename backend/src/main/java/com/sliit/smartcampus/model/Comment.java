package com.sliit.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "comments")
public class Comment {

    @Id
    private String id;

    // Discussion updates attached to a booking or ticket workflow.
    private String ticketId;
    private String authorUserId;
    private String message;
    private String createdAt;
}

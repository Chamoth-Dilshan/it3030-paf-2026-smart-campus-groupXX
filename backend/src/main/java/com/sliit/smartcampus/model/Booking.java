package com.sliit.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    // Links a user with a resource and booking lifecycle state.
    private String userId;
    private String resourceId;
    private String startTime;
    private String endTime;
    private String status;
}

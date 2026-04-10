package com.sliit.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    // Maintenance or incident issue reported by a campus user.
    private String title;
    private String description;
    private String status;
    private String priority;
    private String reportedByUserId;
    private String assignedTechnicianId;
}

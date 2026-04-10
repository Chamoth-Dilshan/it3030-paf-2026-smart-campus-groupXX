package com.sliit.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    // Facilities and assets that can be viewed and booked.
    private String name;
    private String type;
    private String location;
    private String status;
}

package com.sliit.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    // University account identity and profile details.
    private String name;
    private String email;
    private String role;
    private String googleId;
}

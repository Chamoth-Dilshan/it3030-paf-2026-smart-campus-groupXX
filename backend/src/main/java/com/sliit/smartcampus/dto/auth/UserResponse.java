package com.sliit.smartcampus.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private boolean active;
}
//kasun akalanka
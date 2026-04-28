package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.auth.UserResponse;
import com.sliit.smartcampus.model.User;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(String id);
    UserResponse updateUserRole(String id, String role);
    void deleteUser(String id);
    UserResponse deactivateUser(String id);
    List<User> getManagers();
    User save(User user);
    boolean existsByEmail(String email);
    User findByEmail(String email);
}
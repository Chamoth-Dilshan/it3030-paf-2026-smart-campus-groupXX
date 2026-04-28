package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.auth.AuthResponse;
import com.sliit.smartcampus.dto.auth.LoginRequest;
import com.sliit.smartcampus.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse createUser(RegisterRequest request, String role);
}
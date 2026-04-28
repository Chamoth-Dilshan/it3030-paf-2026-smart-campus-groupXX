package com.sliit.smartcampus.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.dto.auth.AuthResponse;
import com.sliit.smartcampus.dto.auth.LoginRequest;
import com.sliit.smartcampus.dto.auth.RegisterRequest;
import com.sliit.smartcampus.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/auth/admin/create-user (Admin creates user with any role)
@PostMapping("/admin/create-user")
public ResponseEntity<?> createUser(@Valid @RequestBody RegisterRequest request,
                                     @RequestParam String role) {
    try {
        AuthResponse response = authService.createUser(request, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
}
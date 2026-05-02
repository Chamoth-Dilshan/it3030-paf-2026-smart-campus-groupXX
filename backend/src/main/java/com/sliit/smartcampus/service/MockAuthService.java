package com.sliit.smartcampus.service;

import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.security.JwtUtil;
import com.sliit.smartcampus.dto.auth.AuthResponse;
import com.sliit.smartcampus.dto.auth.LoginRequest;
import com.sliit.smartcampus.dto.auth.RegisterRequest;
import com.sliit.smartcampus.model.Role;
import com.sliit.smartcampus.model.User;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Profile("mock")
public class MockAuthService implements AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userService.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        Role role = Role.USER;
        if (request.getRole() != null) {
            try {
                role = Role.fromValue(request.getRole());
            } catch (IllegalArgumentException e) {
                // Fallback
            }
        }
        user.setRole(role);
        user.setActive(true);

        User savedUser = userService.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().apiName());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().apiName()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userService.findByEmail(request.getEmail());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        Role role = user.getRole() != null ? user.getRole().canonical() : Role.USER;
        String token = jwtUtil.generateToken(user.getEmail(), role.apiName());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                role.apiName()
        );
    }

    @Override
    public AuthResponse createUser(RegisterRequest request, String role) {
        if (userService.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.fromValue(role));
        user.setActive(true);

        User savedUser = userService.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().apiName());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().apiName()
        );
    }
}

package com.sliit.smartcampus.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.model.Role;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Check if user exists, if not create one
        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : email);
            newUser.setPassword("OAUTH_USER");
            newUser.setRole(Role.USER);
            newUser.setActive(true);
            newUser.setCreatedAt(LocalDateTime.now());
            user = userRepository.save(newUser); // ✅ capture saved user with ID
        } else {
            user = existingUser.get();
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Redirect to frontend with token
        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl.replaceAll("/+$", ""))
                .path("/oauth-success")
                .queryParam("token", token)
                .queryParam("name", user.getName() != null ? user.getName() : email)
                .queryParam("email", user.getEmail())
                .queryParam("role", user.getRole().name())
                .queryParam("id", user.getId() != null ? user.getId() : "")
                .build()
                .encode()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}

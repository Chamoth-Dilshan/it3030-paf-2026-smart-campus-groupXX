package com.sliit.smartcampus.booking;

import com.sliit.smartcampus.controller.BookingController;
import com.sliit.smartcampus.exception.common.GlobalExceptionHandler;
import com.sliit.smartcampus.model.Role;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        BookingService bookingService = new BookingService(bookingRepository, resourceRepository);
        BookingController bookingController = new BookingController(bookingService, userRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void approveBookingUsesPrincipalRoleInsteadOfSpoofedHeaders() throws Exception {
        User user = User.builder()
                .id("user-1")
                .name("Student User")
                .email("student@campus.edu")
                .role(Role.USER)
                .active(true)
                .build();
        when(userRepository.findByEmail("student@campus.edu")).thenReturn(Optional.of(user));

        Authentication principal = new UsernamePasswordAuthenticationToken(
                "student@campus.edu",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        mockMvc.perform(patch("/api/bookings/booking-1/approve")
                        .principal(principal)
                        .header("X-User-Id", "admin-1")
                        .header("X-User-Role", "ADMIN"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only admins can perform this booking action."));

        verifyNoInteractions(bookingRepository, resourceRepository);
    }
}

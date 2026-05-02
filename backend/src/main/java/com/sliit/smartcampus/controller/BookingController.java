package com.sliit.smartcampus.controller;

import jakarta.validation.Valid;
import com.sliit.smartcampus.dto.booking.AvailabilitySlotResponse;
import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.dto.booking.BookingResponse;
import com.sliit.smartcampus.dto.booking.BookingReviewRequest;
import com.sliit.smartcampus.dto.booking.BookingStatusResponse;
import com.sliit.smartcampus.dto.booking.CreateBookingRequest;
import com.sliit.smartcampus.exception.common.ForbiddenException;
import com.sliit.smartcampus.model.Role;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.BookingService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PATCH,
        RequestMethod.OPTIONS
})
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return new ResponseEntity<>(
                bookingService.createBooking(request, currentUser.id(), currentUser.role()),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return ResponseEntity.ok(bookingService.getAllBookings(status, currentUser.id(), currentUser.role()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return ResponseEntity.ok(bookingService.getMyBookings(currentUser.id()));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<AvailabilitySlotResponse>> getAvailability(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getAvailability(resourceId, date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable String id,
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUser.id(), currentUser.role()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return ResponseEntity.ok(bookingService.updateBooking(id, request, currentUser.id(), currentUser.role()));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingStatusResponse> approveBooking(
            @PathVariable String id,
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return ResponseEntity.ok(bookingService.approveBooking(id, currentUser.id(), currentUser.role()));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingStatusResponse> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingReviewRequest request,
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return ResponseEntity.ok(bookingService.rejectBooking(id, request, currentUser.id(), currentUser.role()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingStatusResponse> cancelBooking(
            @PathVariable String id,
            Authentication authentication) {
        AuthenticatedBookingUser currentUser = currentUser(authentication);
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUser.id(), currentUser.role()));
    }

    private AuthenticatedBookingUser currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Authentication is required.");
        }

        String email = authentication.getName();
        if (email == null || email.isBlank()) {
            throw new ForbiddenException("Authenticated user email is required.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("Authenticated user was not found."));
        if (!user.isActive()) {
            throw new ForbiddenException("Authenticated user account is inactive.");
        }

        Role role = resolveRole(authentication, user);
        return new AuthenticatedBookingUser(user.getId(), role);
    }

    private Role resolveRole(Authentication authentication, User user) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String value = authority.getAuthority();
            if (value == null || value.isBlank()) {
                continue;
            }
            String normalized = value.startsWith("ROLE_") ? value.substring("ROLE_".length()) : value;
            try {
                return Role.valueOf(normalized.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Continue looking for a recognized application role.
            }
        }

        if (user.getRole() != null) {
            return user.getRole();
        }
        throw new ForbiddenException("Authenticated user role is not recognized.");
    }

    private record AuthenticatedBookingUser(String id, Role role) {
    }
}

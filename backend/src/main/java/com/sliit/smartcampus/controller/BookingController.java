package com.sliit.smartcampus.controller;

import jakarta.validation.Valid;
import com.sliit.smartcampus.dto.booking.AvailabilitySlotResponse;
import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.dto.booking.BookingResponse;
import com.sliit.smartcampus.dto.booking.BookingReviewRequest;
import com.sliit.smartcampus.dto.booking.BookingStatusResponse;
import com.sliit.smartcampus.dto.booking.CreateBookingRequest;
import com.sliit.smartcampus.model.Role;
import com.sliit.smartcampus.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") String currentUserRole) {
        return new ResponseEntity<>(
                bookingService.createBooking(request, currentUserId, parseRole(currentUserRole)),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") String currentUserRole) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, currentUserId, parseRole(currentUserRole)));
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader("X-User-Id") String currentUserId) {
        return ResponseEntity.ok(bookingService.getMyBookings(currentUserId));
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
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") String currentUserRole) {
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUserId, parseRole(currentUserRole)));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingStatusResponse> approveBooking(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") String currentUserRole) {
        return ResponseEntity.ok(bookingService.approveBooking(id, currentUserId, parseRole(currentUserRole)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingStatusResponse> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingReviewRequest request,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") String currentUserRole) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request, currentUserId, parseRole(currentUserRole)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingStatusResponse> cancelBooking(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader("X-User-Role") String currentUserRole) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUserId, parseRole(currentUserRole)));
    }

    private Role parseRole(String role) {
        // TODO: Replace header parsing with the authenticated principal when the Auth module exposes it.
        return Role.valueOf(role.trim().toUpperCase());
    }
}

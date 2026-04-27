package com.sliit.smartcampus.service;

import java.time.LocalTime;
import java.util.List;

import com.sliit.smartcampus.dto.BookingResponse;
import com.sliit.smartcampus.dto.BookingReviewRequest;
import com.sliit.smartcampus.dto.BookingStatusResponse;
import com.sliit.smartcampus.dto.CreateBookingRequest;
import com.sliit.smartcampus.exception.BookingConflictException;
import com.sliit.smartcampus.exception.BookingNotFoundException;
import com.sliit.smartcampus.exception.BookingValidationException;
import com.sliit.smartcampus.exception.InvalidBookingStateException;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import com.sliit.smartcampus.repository.BookingRepository;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public BookingResponse createBooking(CreateBookingRequest request, String userId) {
        validateCreateRequest(request);
        validateRequiredText(userId, "User ID is required");
        // TODO: When the resource module is implemented, verify that resourceId exists and is bookable.
        ensureNoOverlappingBooking(request);

        Booking booking = new Booking(
                request.getResourceId().trim(),
                userId.trim(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getPurpose().trim(),
                request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return BookingResponse.fromBooking(bookingRepository.save(booking));
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::fromBooking)
                .toList();
    }

    public List<BookingResponse> getMyBookings(String userId) {
        validateRequiredText(userId, "User ID is required");

        return bookingRepository.findByUserIdOrderByDateDescStartTimeDesc(userId.trim())
                .stream()
                .map(BookingResponse::fromBooking)
                .toList();
    }

    public BookingResponse getBookingById(String bookingId) {
        return BookingResponse.fromBooking(findBookingOrThrow(bookingId));
    }

    public BookingStatusResponse approveBooking(String bookingId, String reviewedBy) {
        validateRequiredText(reviewedBy, "Reviewer ID is required");

        Booking booking = findBookingOrThrow(bookingId);
        requireStatus(booking, BookingStatus.PENDING, "Only pending bookings can be approved");
        ensureNoOtherOverlappingBooking(booking);

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewReason(null);
        booking.setReviewedBy(reviewedBy.trim());

        return BookingStatusResponse.fromBooking(bookingRepository.save(booking));
    }

    public BookingStatusResponse rejectBooking(String bookingId, BookingReviewRequest request, String reviewedBy) {
        validateReviewRequest(request, BookingStatus.REJECTED);
        validateRequiredText(reviewedBy, "Reviewer ID is required");

        Booking booking = findBookingOrThrow(bookingId);
        requireStatus(booking, BookingStatus.PENDING, "Only pending bookings can be rejected");

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewReason(request.getReviewReason().trim());
        booking.setReviewedBy(reviewedBy.trim());

        return BookingStatusResponse.fromBooking(bookingRepository.save(booking));
    }

    public BookingStatusResponse cancelBooking(String bookingId, String userId) {
        validateRequiredText(userId, "User ID is required");

        Booking booking = findBookingOrThrow(bookingId);
        requireStatus(booking, BookingStatus.APPROVED, "Only approved bookings can be cancelled");

        // TODO: When authentication is implemented, verify this user owns the booking or has an admin role.
        booking.setStatus(BookingStatus.CANCELLED);

        return BookingStatusResponse.fromBooking(bookingRepository.save(booking));
    }

    private Booking findBookingOrThrow(String bookingId) {
        validateRequiredText(bookingId, "Booking ID is required");
        return bookingRepository.findById(bookingId.trim())
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));
    }

    private void validateCreateRequest(CreateBookingRequest request) {
        if (request == null) {
            throw new BookingValidationException("Booking request is required");
        }
        validateRequiredText(request.getResourceId(), "Resource ID is required");
        validateRequiredText(request.getPurpose(), "Purpose is required");
        if (request.getDate() == null) {
            throw new BookingValidationException("Booking date is required");
        }
        if (request.getStartTime() == null) {
            throw new BookingValidationException("Start time is required");
        }
        if (request.getEndTime() == null) {
            throw new BookingValidationException("End time is required");
        }
        validateTimeRange(request.getStartTime(), request.getEndTime());
        if (request.getExpectedAttendees() == null || request.getExpectedAttendees() <= 0) {
            throw new BookingValidationException("Expected attendees must be greater than zero");
        }
    }

    private void validateReviewRequest(BookingReviewRequest request, BookingStatus expectedStatus) {
        if (request == null) {
            throw new BookingValidationException("Review request is required");
        }
        if (request.getStatus() != expectedStatus) {
            throw new BookingValidationException("Review status must be " + expectedStatus);
        }
        if (expectedStatus == BookingStatus.REJECTED) {
            validateRequiredText(request.getReviewReason(), "Review reason is required when rejecting a booking");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new BookingValidationException("End time must be after start time");
        }
    }

    private void validateRequiredText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new BookingValidationException(message);
        }
    }

    private void requireStatus(Booking booking, BookingStatus requiredStatus, String message) {
        if (booking.getStatus() != requiredStatus) {
            throw new InvalidBookingStateException(message);
        }
    }

    private void ensureNoOverlappingBooking(CreateBookingRequest request) {
        boolean hasOverlap = bookingRepository.existsByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                request.getResourceId().trim(),
                request.getDate(),
                ACTIVE_STATUSES,
                request.getEndTime(),
                request.getStartTime());

        if (hasOverlap) {
            throw new BookingConflictException("Resource already has a booking during the selected time");
        }
    }

    private void ensureNoOtherOverlappingBooking(Booking booking) {
        List<Booking> overlappingBookings = bookingRepository
                .findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        booking.getResourceId(),
                        booking.getDate(),
                        ACTIVE_STATUSES,
                        booking.getEndTime(),
                        booking.getStartTime());

        boolean hasOtherOverlap = overlappingBookings.stream()
                .anyMatch(overlap -> !overlap.getId().equals(booking.getId()));

        if (hasOtherOverlap) {
            throw new BookingConflictException("Resource already has another booking during the selected time");
        }
    }
}

package com.sliit.smartcampus.service;

import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.dto.booking.BookingResponse;
import com.sliit.smartcampus.dto.booking.BookingReviewRequest;
import com.sliit.smartcampus.dto.booking.BookingStatusResponse;
import com.sliit.smartcampus.dto.booking.CreateBookingRequest;
import com.sliit.smartcampus.exception.booking.BookingConflictException;
import com.sliit.smartcampus.exception.booking.BookingNotFoundException;
import com.sliit.smartcampus.exception.booking.InvalidBookingStateException;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import com.sliit.smartcampus.repository.BookingRepository;
import org.example.backend.exceptions.ForbiddenException;
import org.example.backend.models.Role;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final List<BookingStatus> BLOCKING_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;

    public BookingResponse createBooking(CreateBookingRequest request, String currentUserId, Role currentUserRole) {
        requireUser(currentUserId, currentUserRole);
        validateTimeRange(request.getDate(), request.getStartTime(), request.getEndTime());

        // TODO: Validate resourceId and capacity through the Resources module once its contract is finalized.
        ensureNoConflict(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                null);

        LocalDateTime now = LocalDateTime.now();
        Booking booking = Booking.builder()
                .resourceId(request.getResourceId().trim())
                .userId(currentUserId)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getAllBookings(String status, String currentUserId, Role currentUserRole) {
        requireAdmin(currentUserRole);

        List<Booking> bookings;
        if (status == null || status.isBlank()) {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        } else {
            bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(parseStatus(status));
        }

        return bookings.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getMyBookings(String currentUserId) {
        requireCurrentUserId(currentUserId);

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(String id, String currentUserId, Role currentUserRole) {
        Booking booking = findBooking(id);
        if (currentUserRole != Role.ADMIN && !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only view your own bookings.");
        }
        return toResponse(booking);
    }

    public BookingStatusResponse approveBooking(String id, String currentUserId, Role currentUserRole) {
        requireAdmin(currentUserRole);
        Booking booking = findBooking(id);
        requireStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be approved.");

        ensureNoConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId());

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewReason(null);
        booking.setReviewedBy(currentUserId);
        booking.setUpdatedAt(LocalDateTime.now());

        return toStatusResponse(bookingRepository.save(booking), "Booking approved successfully.");
    }

    public BookingStatusResponse rejectBooking(String id, BookingReviewRequest request, String currentUserId, Role currentUserRole) {
        requireAdmin(currentUserRole);
        Booking booking = findBooking(id);
        requireStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be rejected.");

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewReason(request.getReason().trim());
        booking.setReviewedBy(currentUserId);
        booking.setUpdatedAt(LocalDateTime.now());

        return toStatusResponse(bookingRepository.save(booking), "Booking rejected successfully.");
    }

    public BookingStatusResponse cancelBooking(String id, String currentUserId, Role currentUserRole) {
        Booking booking = findBooking(id);

        if (currentUserRole != Role.ADMIN) {
            if (currentUserRole != Role.USER || !booking.getUserId().equals(currentUserId)) {
                throw new ForbiddenException("You can only cancel your own approved bookings.");
            }
        }

        requireStatus(booking, BookingStatus.APPROVED, "Only APPROVED bookings can be cancelled.");

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        return toStatusResponse(bookingRepository.save(booking), "Booking cancelled successfully.");
    }

    private void validateTimeRange(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date == null || startTime == null || endTime == null) {
            throw new InvalidBookingStateException("Booking date, start time, and end time are required.");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new InvalidBookingStateException("Booking date cannot be in the past.");
        }
        if (!startTime.isBefore(endTime)) {
            throw new InvalidBookingStateException("Start time must be before end time.");
        }
    }

    private void ensureNoConflict(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String ignoredBookingId) {
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                        date,
                        BLOCKING_STATUSES,
                        endTime,
                        startTime);

        boolean hasConflict = conflicts.stream()
                .filter(booking -> ignoredBookingId == null || !booking.getId().equals(ignoredBookingId))
                .anyMatch(booking -> overlaps(startTime, endTime, booking.getStartTime(), booking.getEndTime()));

        if (hasConflict) {
            throw new BookingConflictException("This resource already has a booking for the selected date and time.");
        }
    }

    private boolean overlaps(LocalTime startTime, LocalTime endTime, LocalTime existingStartTime, LocalTime existingEndTime) {
        return startTime.isBefore(existingEndTime) && endTime.isAfter(existingStartTime);
    }

    private Booking findBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
    }

    private BookingStatus parseStatus(String status) {
        try {
            return BookingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new InvalidBookingStateException("Invalid booking status: " + status);
        }
    }

    private void requireUser(String currentUserId, Role role) {
        requireCurrentUserId(currentUserId);
        if (role != Role.USER) {
            throw new ForbiddenException("Only users can request bookings.");
        }
    }

    private void requireAdmin(Role role) {
        if (role != Role.ADMIN) {
            throw new ForbiddenException("Only admins can perform this booking action.");
        }
    }

    private void requireCurrentUserId(String currentUserId) {
        if (currentUserId == null || currentUserId.isBlank()) {
            throw new InvalidBookingStateException("Current user id is required.");
        }
    }

    private void requireStatus(Booking booking, BookingStatus expectedStatus, String message) {
        if (booking.getStatus() != expectedStatus) {
            throw new InvalidBookingStateException(message + " Current status: " + booking.getStatus());
        }
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .userId(booking.getUserId())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .reviewReason(booking.getReviewReason())
                .reviewedBy(booking.getReviewedBy())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private BookingStatusResponse toStatusResponse(Booking booking, String message) {
        return BookingStatusResponse.builder()
                .id(booking.getId())
                .status(booking.getStatus())
                .reviewReason(booking.getReviewReason())
                .reviewedBy(booking.getReviewedBy())
                .updatedAt(booking.getUpdatedAt())
                .message(message)
                .build();
    }
}

package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.dtos.AvailabilitySlotDTO;
import org.example.backend.dtos.BookingResponse;
import org.example.backend.dtos.BookingReviewRequest;
import org.example.backend.dtos.BookingStatusResponse;
import org.example.backend.dtos.CreateBookingRequest;
import org.example.backend.exceptions.BookingConflictException;
import org.example.backend.exceptions.BookingNotFoundException;
import org.example.backend.exceptions.ForbiddenException;
import org.example.backend.exceptions.InvalidBookingStateException;
import org.example.backend.models.Booking;
import org.example.backend.models.BookingStatus;
import org.example.backend.models.Role;
import org.example.backend.repositories.BookingRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Profile("!mock")
@RequiredArgsConstructor
public class MongoBookingService implements BookingService {

    private static final List<BookingStatus> BLOCKING_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED);
    private static final List<BookingStatus> APPROVED_STATUS = List.of(BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;

    @Override
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

    @Override
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

    @Override
    public List<BookingResponse> getMyBookings(String currentUserId) {
        requireCurrentUserId(currentUserId);

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(String id, String currentUserId, Role currentUserRole) {
        Booking booking = findBooking(id);
        if (currentUserRole != Role.ADMIN && !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only view your own bookings.");
        }
        return toResponse(booking);
    }

    @Override
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

    @Override
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

    @Override
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

    @Override
    public List<AvailabilitySlotDTO> getAvailability(String resourceId, LocalDate date) {
        List<Booking> approvedBookings = bookingRepository.findByResourceIdAndDateAndStatusIn(
                resourceId,
                date,
                APPROVED_STATUS);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        List<AvailabilitySlotDTO> slots = new ArrayList<>();

        for (int hour = 8; hour < 20; hour++) {
            LocalTime slotStart = LocalTime.of(hour, 0);
            LocalTime slotEnd = LocalTime.of(hour + 1, 0);
            boolean booked = approvedBookings.stream()
                    .anyMatch(booking -> overlaps(slotStart, slotEnd, booking.getStartTime(), booking.getEndTime()));

            slots.add(AvailabilitySlotDTO.builder()
                    .startTime(slotStart.format(formatter))
                    .endTime(slotEnd.format(formatter))
                    .status(booked ? "BOOKED" : "AVAILABLE")
                    .build());
        }

        return slots;
    }

    @Override
    public Map<String, Object> getAnalytics() {
        List<Booking> approvedBookings = bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.APPROVED);

        Map<String, Long> resourceCounts = approvedBookings.stream()
                .collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()));

        List<Map<String, Object>> mostUsedResources = resourceCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> resource = new LinkedHashMap<>();
                    resource.put("resourceId", entry.getKey());
                    resource.put("resourceName", entry.getKey());
                    resource.put("bookingCount", entry.getValue());
                    return resource;
                })
                .collect(Collectors.toList());

        Map<Integer, Long> hourCounts = approvedBookings.stream()
                .collect(Collectors.groupingBy(booking -> booking.getStartTime().getHour(), Collectors.counting()));

        List<Map<String, Object>> peakHours = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            Map<String, Object> hourData = new LinkedHashMap<>();
            hourData.put("hour", hour);
            hourData.put("count", hourCounts.getOrDefault(hour, 0L));
            peakHours.add(hourData);
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("mostUsedResources", mostUsedResources);
        analytics.put("peakBookingHours", peakHours);
        return analytics;
    }

    @Override
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalBookings", bookingRepository.count());
        stats.put("pendingBookings", bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.put("approvedBookings", bookingRepository.countByStatus(BookingStatus.APPROVED));
        stats.put("rejectedBookings", bookingRepository.countByStatus(BookingStatus.REJECTED));
        stats.put("cancelledBookings", bookingRepository.countByStatus(BookingStatus.CANCELLED));
        return stats;
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

package org.example.backend.services;

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
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Profile("mock")
public class MockBookingService implements BookingService {

    private final List<Booking> bookings = new ArrayList<>();

    public MockBookingService() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        bookings.add(Booking.builder()
                .id("BK-9001")
                .userId("user-1")
                .resourceId("RES-101")
                .date(tomorrow)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .purpose("Faculty Meeting")
                .expectedAttendees(15)
                .status(BookingStatus.APPROVED)
                .reviewedBy("admin-1")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusHours(12))
                .build());
        bookings.add(Booking.builder()
                .id("BK-9002")
                .userId("user-2")
                .resourceId("RES-102")
                .date(tomorrow.plusDays(1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 0))
                .purpose("Project Discussion")
                .expectedAttendees(8)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now().minusHours(2))
                .updatedAt(LocalDateTime.now().minusHours(2))
                .build());
    }

    @Override
    public BookingResponse createBooking(CreateBookingRequest request, String currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.USER) {
            throw new ForbiddenException("Only users can request bookings.");
        }
        validateTimeRange(request.getDate(), request.getStartTime(), request.getEndTime());
        ensureNoConflict(request.getResourceId(), request.getDate(), request.getStartTime(), request.getEndTime(), null);

        LocalDateTime now = LocalDateTime.now();
        Booking booking = Booking.builder()
                .id("BK-" + UUID.randomUUID().toString().substring(0, 8))
                .resourceId(request.getResourceId())
                .userId(currentUserId)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .build();
        bookings.add(booking);
        return toResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings(String status, String currentUserId, Role currentUserRole) {
        if (currentUserRole != Role.ADMIN) {
            throw new ForbiddenException("Only admins can perform this booking action.");
        }
        return bookings.stream()
                .filter(booking -> status == null || status.isBlank() || booking.getStatus() == BookingStatus.valueOf(status.toUpperCase()))
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getMyBookings(String currentUserId) {
        return bookings.stream()
                .filter(booking -> booking.getUserId().equals(currentUserId))
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
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
        requirePending(booking, "Only PENDING bookings can be approved.");
        ensureNoConflict(booking.getResourceId(), booking.getDate(), booking.getStartTime(), booking.getEndTime(), booking.getId());

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewReason(null);
        booking.setReviewedBy(currentUserId);
        booking.setUpdatedAt(LocalDateTime.now());
        return toStatusResponse(booking, "Booking approved successfully.");
    }

    @Override
    public BookingStatusResponse rejectBooking(String id, BookingReviewRequest request, String currentUserId, Role currentUserRole) {
        requireAdmin(currentUserRole);
        Booking booking = findBooking(id);
        requirePending(booking, "Only PENDING bookings can be rejected.");

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewReason(request.getReason().trim());
        booking.setReviewedBy(currentUserId);
        booking.setUpdatedAt(LocalDateTime.now());
        return toStatusResponse(booking, "Booking rejected successfully.");
    }

    @Override
    public BookingStatusResponse cancelBooking(String id, String currentUserId, Role currentUserRole) {
        Booking booking = findBooking(id);
        if (currentUserRole != Role.ADMIN && (currentUserRole != Role.USER || !booking.getUserId().equals(currentUserId))) {
            throw new ForbiddenException("You can only cancel your own approved bookings.");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingStateException("Only APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        return toStatusResponse(booking, "Booking cancelled successfully.");
    }

    @Override
    public List<AvailabilitySlotDTO> getAvailability(String resourceId, LocalDate date) {
        List<Booking> approved = bookings.stream()
                .filter(booking -> booking.getResourceId().equals(resourceId))
                .filter(booking -> booking.getDate().equals(date))
                .filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
                .collect(Collectors.toList());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        List<AvailabilitySlotDTO> slots = new ArrayList<>();
        for (int hour = 8; hour < 20; hour++) {
            LocalTime slotStart = LocalTime.of(hour, 0);
            LocalTime slotEnd = LocalTime.of(hour + 1, 0);
            boolean booked = approved.stream().anyMatch(booking -> overlaps(slotStart, slotEnd, booking.getStartTime(), booking.getEndTime()));
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
        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("mostUsedResources", List.of());
        analytics.put("peakBookingHours", List.of());
        return analytics;
    }

    @Override
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalBookings", (long) bookings.size());
        stats.put("pendingBookings", countStatus(BookingStatus.PENDING));
        stats.put("approvedBookings", countStatus(BookingStatus.APPROVED));
        stats.put("rejectedBookings", countStatus(BookingStatus.REJECTED));
        stats.put("cancelledBookings", countStatus(BookingStatus.CANCELLED));
        return stats;
    }

    private long countStatus(BookingStatus status) {
        return bookings.stream().filter(booking -> booking.getStatus() == status).count();
    }

    private void validateTimeRange(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date == null || startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new InvalidBookingStateException("Start time must be before end time.");
        }
    }

    private void ensureNoConflict(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String ignoredBookingId) {
        boolean conflict = bookings.stream()
                .filter(booking -> ignoredBookingId == null || !booking.getId().equals(ignoredBookingId))
                .filter(booking -> booking.getResourceId().equals(resourceId))
                .filter(booking -> booking.getDate().equals(date))
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.APPROVED)
                .anyMatch(booking -> overlaps(startTime, endTime, booking.getStartTime(), booking.getEndTime()));

        if (conflict) {
            throw new BookingConflictException("This resource already has a booking for the selected date and time.");
        }
    }

    private boolean overlaps(LocalTime startTime, LocalTime endTime, LocalTime existingStartTime, LocalTime existingEndTime) {
        return startTime.isBefore(existingEndTime) && endTime.isAfter(existingStartTime);
    }

    private Booking findBooking(String id) {
        return bookings.stream()
                .filter(booking -> booking.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
    }

    private void requireAdmin(Role role) {
        if (role != Role.ADMIN) {
            throw new ForbiddenException("Only admins can perform this booking action.");
        }
    }

    private void requirePending(Booking booking, String message) {
        if (booking.getStatus() != BookingStatus.PENDING) {
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

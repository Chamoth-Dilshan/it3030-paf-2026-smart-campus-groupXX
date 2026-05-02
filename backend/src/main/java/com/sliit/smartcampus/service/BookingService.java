package com.sliit.smartcampus.service;

import lombok.RequiredArgsConstructor;
import com.sliit.smartcampus.dto.booking.AvailabilitySlotResponse;
import com.sliit.smartcampus.dto.booking.BookingResponse;
import com.sliit.smartcampus.dto.booking.BookingReviewRequest;
import com.sliit.smartcampus.dto.booking.BookingStatusResponse;
import com.sliit.smartcampus.dto.booking.CreateBookingRequest;
import com.sliit.smartcampus.exception.booking.BookingConflictException;
import com.sliit.smartcampus.exception.booking.BookingNotFoundException;
import com.sliit.smartcampus.exception.booking.InvalidBookingStateException;
import com.sliit.smartcampus.exception.resource.ResourceNotFoundException;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.ResourceStatus;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.exception.common.ForbiddenException;
import com.sliit.smartcampus.model.Role;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final DateTimeFormatter SLOT_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final LocalTime DEFAULT_OPEN_TIME = LocalTime.of(8, 0);
    private static final LocalTime DEFAULT_CLOSE_TIME = LocalTime.of(18, 0);

    private static final List<BookingStatus> AVAILABILITY_BLOCKING_STATUSES = List.of(BookingStatus.APPROVED);
    private static final List<BookingStatus> REQUEST_BLOCKING_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingResponse createBooking(CreateBookingRequest request, String currentUserId, Role currentUserRole) {
        requireUser(currentUserId, currentUserRole);
        validateTimeRange(request.getDate(), request.getStartTime(), request.getEndTime());
        validateExpectedAttendees(request.getExpectedAttendees());
        Resource resource = validateBookableResource(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getExpectedAttendees());

        ensureNoConflict(
                resource.getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                null,
                REQUEST_BLOCKING_STATUSES);

        LocalDateTime now = LocalDateTime.now();
        Booking booking = Booking.builder()
                .resourceId(resource.getId())
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

    public BookingResponse updateBooking(String id, CreateBookingRequest request, String currentUserId, Role currentUserRole) {
        requireCurrentUserId(currentUserId);
        validateTimeRange(request.getDate(), request.getStartTime(), request.getEndTime());
        validateExpectedAttendees(request.getExpectedAttendees());

        Booking booking = findBooking(id);
        requireStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be edited.");
        if (currentUserRole != Role.ADMIN && !booking.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("You can only edit your own pending bookings.");
        }
        Resource resource = validateBookableResource(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getExpectedAttendees());

        ensureNoConflict(
                resource.getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                booking.getId(),
                REQUEST_BLOCKING_STATUSES);

        booking.setResourceId(resource.getId());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setUpdatedAt(LocalDateTime.now());

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

        return toResponses(bookings);
    }

    public List<BookingResponse> getMyBookings(String currentUserId) {
        requireCurrentUserId(currentUserId);

        return toResponses(bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUserId));
    }

    public List<AvailabilitySlotResponse> getAvailability(String resourceId, LocalDate date) {
        if (resourceId == null || resourceId.isBlank()) {
            throw new InvalidBookingStateException("Resource ID is required.");
        }
        if (date == null) {
            throw new InvalidBookingStateException("Availability date is required.");
        }

        Resource resource = resourceRepository.findById(resourceId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        LocalTime openTime = parseAvailabilityTime(resource.getAvailableTimes(), "start", DEFAULT_OPEN_TIME);
        LocalTime closeTime = parseAvailabilityTime(resource.getAvailableTimes(), "end", DEFAULT_CLOSE_TIME);
        if (!openTime.isBefore(closeTime)) {
            throw new InvalidBookingStateException("Resource availability hours are not configured correctly.");
        }

        List<Booking> bookings = bookingRepository.findByResourceIdAndDateAndStatusInOrderByStartTimeAsc(
                resource.getId(),
                date,
                AVAILABILITY_BLOCKING_STATUSES);

        boolean operational = isOperational(resource) && isAvailableOnDate(resource, date);
        List<AvailabilitySlotResponse> slots = new ArrayList<>();
        LocalTime slotStart = openTime;
        while (slotStart.isBefore(closeTime)) {
            LocalTime slotEnd = slotStart.plusHours(1);
            if (slotEnd.isAfter(closeTime)) {
                slotEnd = closeTime;
            }

            LocalTime currentSlotStart = slotStart;
            LocalTime currentSlotEnd = slotEnd;
            boolean booked = !operational || bookings.stream()
                    .anyMatch(booking -> overlaps(
                            currentSlotStart,
                            currentSlotEnd,
                            booking.getStartTime(),
                            booking.getEndTime()));

            slots.add(AvailabilitySlotResponse.builder()
                    .startTime(currentSlotStart.format(SLOT_TIME_FORMATTER))
                    .endTime(currentSlotEnd.format(SLOT_TIME_FORMATTER))
                    .status(booked ? "BOOKED" : "AVAILABLE")
                    .build());

            slotStart = slotEnd;
        }

        return slots;
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
        validateBookableResource(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getExpectedAttendees());

        ensureNoConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId(),
                AVAILABILITY_BLOCKING_STATUSES);

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

    private void validateExpectedAttendees(Integer expectedAttendees) {
        if (expectedAttendees == null || expectedAttendees < 1) {
            throw new InvalidBookingStateException("Expected attendees must be at least 1.");
        }
    }

    private Resource validateBookableResource(
            String resourceId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            int expectedAttendees) {
        String normalizedResourceId = normalizeResourceId(resourceId);
        if (normalizedResourceId == null) {
            throw new InvalidBookingStateException("Resource ID is required.");
        }

        Resource resource = resourceRepository.findById(normalizedResourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + normalizedResourceId));

        if (!isOperational(resource)) {
            throw new InvalidBookingStateException("Resource is not available for booking.");
        }
        if (!isAvailableOnDate(resource, date)) {
            throw new InvalidBookingStateException("Resource is not available on the selected date.");
        }
        if (resource.getCapacity() > 0 && expectedAttendees > resource.getCapacity()) {
            throw new InvalidBookingStateException("Expected attendees exceed the resource capacity.");
        }

        LocalTime openTime = parseAvailabilityTime(resource.getAvailableTimes(), "start", DEFAULT_OPEN_TIME);
        LocalTime closeTime = parseAvailabilityTime(resource.getAvailableTimes(), "end", DEFAULT_CLOSE_TIME);
        if (!openTime.isBefore(closeTime)) {
            throw new InvalidBookingStateException("Resource availability hours are not configured correctly.");
        }
        if (startTime.isBefore(openTime) || endTime.isAfter(closeTime)) {
            throw new InvalidBookingStateException("Booking time must be within the resource availability hours.");
        }

        return resource;
    }

    private void ensureNoConflict(
            String resourceId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String ignoredBookingId,
            List<BookingStatus> blockingStatuses) {
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                        date,
                        blockingStatuses,
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

    private LocalTime parseAvailabilityTime(Map<String, String> availableTimes, String key, LocalTime fallback) {
        if (availableTimes == null || availableTimes.get(key) == null || availableTimes.get(key).isBlank()) {
            return fallback;
        }
        try {
            return LocalTime.parse(availableTimes.get(key).trim());
        } catch (DateTimeParseException ex) {
            throw new InvalidBookingStateException("Invalid resource availability time: " + availableTimes.get(key));
        }
    }

    private boolean isOperational(Resource resource) {
        ResourceStatus status = resource.getStatus();
        return status == null || status == ResourceStatus.ACTIVE || status == ResourceStatus.AVAILABLE;
    }

    private boolean isAvailableOnDate(Resource resource, LocalDate date) {
        List<String> availableDays = resource.getAvailableDays();
        if (availableDays == null || availableDays.isEmpty()) {
            return true;
        }

        String day = date.getDayOfWeek().name();
        return availableDays.stream()
                .anyMatch(availableDay -> day.equalsIgnoreCase(availableDay));
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
        return toResponse(booking, resolveResourceName(booking.getResourceId()));
    }

    private List<BookingResponse> toResponses(List<Booking> bookings) {
        Set<String> resourceIds = bookings.stream()
                .map(Booking::getResourceId)
                .filter(resourceId -> resourceId != null && !resourceId.isBlank())
                .map(String::trim)
                .collect(Collectors.toSet());

        Map<String, String> resourceNamesById = new HashMap<>();
        if (!resourceIds.isEmpty()) {
            Iterable<Resource> resources = resourceRepository.findAllById(resourceIds);
            if (resources != null) {
                resources.forEach(resource -> resourceNamesById.put(resource.getId(), resource.getName()));
            }
        }

        return bookings.stream()
                .map(booking -> toResponse(booking, resourceNamesById.get(normalizeResourceId(booking.getResourceId()))))
                .collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking booking, String resourceName) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .resourceName(resourceName)
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

    private String resolveResourceName(String resourceId) {
        String normalizedResourceId = normalizeResourceId(resourceId);
        if (normalizedResourceId == null) {
            return null;
        }

        var resource = resourceRepository.findById(normalizedResourceId);
        if (resource == null || resource.isEmpty()) {
            return null;
        }
        return resource.get().getName();
    }

    private String normalizeResourceId(String resourceId) {
        if (resourceId == null || resourceId.isBlank()) {
            return null;
        }
        return resourceId.trim();
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

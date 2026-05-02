package com.sliit.smartcampus.booking;

import com.sliit.smartcampus.dto.booking.BookingReviewRequest;
import com.sliit.smartcampus.dto.booking.BookingStatusResponse;
import com.sliit.smartcampus.dto.booking.CreateBookingRequest;
import com.sliit.smartcampus.exception.booking.BookingConflictException;
import com.sliit.smartcampus.exception.booking.InvalidBookingStateException;
import com.sliit.smartcampus.exception.resource.ResourceNotFoundException;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.ResourceStatus;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.service.BookingService;
import com.sliit.smartcampus.model.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, resourceRepository);
    }

    @Test
    void createBookingStoresPendingBookingWhenTimeIsAvailable() {
        CreateBookingRequest request = validRequest();
        when(bookingRepository.findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq("RES-101"),
                eq(request.getDate()),
                anyCollection(),
                eq(request.getEndTime()),
                eq(request.getStartTime()))).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId("booking-1");
            return booking;
        });
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource()));

        var response = bookingService.createBooking(request, "user-1", Role.USER);

        assertEquals("booking-1", response.getId());
        assertEquals("Test Resource", response.getResourceName());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(request.getExpectedAttendees(), response.getExpectedAttendees());

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(captor.capture());
        assertEquals("user-1", captor.getValue().getUserId());
        assertEquals(BookingStatus.PENDING, captor.getValue().getStatus());
    }

    @Test
    void createBookingRejectsOverlappingBookingForSameResourceAndDate() {
        CreateBookingRequest request = validRequest();
        Booking existing = booking("booking-1", BookingStatus.APPROVED, "other-user");
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource()));
        when(bookingRepository.findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq("RES-101"),
                eq(request.getDate()),
                anyCollection(),
                eq(request.getEndTime()),
                eq(request.getStartTime()))).thenReturn(List.of(existing));

        assertThrows(BookingConflictException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBookingRejectsOverlappingPendingBookingForSameResourceAndDate() {
        CreateBookingRequest request = validRequest();
        Booking existing = booking("booking-1", BookingStatus.PENDING, "other-user");
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource()));
        when(bookingRepository.findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq("RES-101"),
                eq(request.getDate()),
                eq(List.of(BookingStatus.PENDING, BookingStatus.APPROVED)),
                eq(request.getEndTime()),
                eq(request.getStartTime()))).thenReturn(List.of(existing));

        assertThrows(BookingConflictException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBookingRejectsMissingResource() {
        CreateBookingRequest request = validRequest();
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBookingRejectsOutOfServiceResource() {
        CreateBookingRequest request = validRequest();
        Resource resource = resource();
        resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource));

        assertThrows(InvalidBookingStateException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBookingRejectsOverCapacityRequest() {
        CreateBookingRequest request = new CreateBookingRequest(
                "RES-101",
                LocalDate.now().plusDays(1),
                LocalTime.of(9, 0),
                LocalTime.of(10, 0),
                "Large event",
                30);
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource()));

        assertThrows(InvalidBookingStateException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBookingRejectsUnavailableResourceDay() {
        LocalDate date = LocalDate.now().plusDays(1);
        CreateBookingRequest request = new CreateBookingRequest(
                "RES-101",
                date,
                LocalTime.of(9, 0),
                LocalTime.of(10, 0),
                "Weekend study group",
                6);
        Resource resource = resource();
        resource.setAvailableDays(List.of(date.plusDays(1).getDayOfWeek().name()));
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource));

        assertThrows(InvalidBookingStateException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBookingRejectsTimeOutsideAvailabilityHours() {
        CreateBookingRequest request = new CreateBookingRequest(
                "RES-101",
                LocalDate.now().plusDays(1),
                LocalTime.of(7, 0),
                LocalTime.of(8, 0),
                "Early setup",
                6);
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource()));

        assertThrows(InvalidBookingStateException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void approveBookingMovesPendingToApproved() {
        Booking pending = booking("booking-1", BookingStatus.PENDING, "user-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(pending));
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource()));
        when(bookingRepository.findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq(pending.getResourceId()),
                eq(pending.getDate()),
                anyCollection(),
                eq(pending.getEndTime()),
                eq(pending.getStartTime()))).thenReturn(List.of(pending));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingStatusResponse response = bookingService.approveBooking("booking-1", "admin-1", Role.ADMIN);

        assertEquals(BookingStatus.APPROVED, response.getStatus());
        assertEquals("admin-1", response.getReviewedBy());
    }

    @Test
    void rejectBookingMovesPendingToRejectedWithReason() {
        Booking pending = booking("booking-1", BookingStatus.PENDING, "user-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(pending));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingStatusResponse response = bookingService.rejectBooking(
                "booking-1",
                new BookingReviewRequest("Resource unavailable"),
                "admin-1",
                Role.ADMIN);

        assertEquals(BookingStatus.REJECTED, response.getStatus());
        assertEquals("Resource unavailable", response.getReviewReason());
        assertEquals("admin-1", response.getReviewedBy());
    }

    @Test
    void updateBookingAllowsOwnerToEditPendingBooking() {
        Booking pending = booking("booking-1", BookingStatus.PENDING, "user-1");
        CreateBookingRequest request = new CreateBookingRequest(
                "RES-101",
                LocalDate.now().plusDays(2),
                LocalTime.of(9, 30),
                LocalTime.of(10, 30),
                "Updated purpose",
                8);

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(pending));
        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource()));
        when(bookingRepository.findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq("RES-101"),
                eq(request.getDate()),
                anyCollection(),
                eq(request.getEndTime()),
                eq(request.getStartTime()))).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = bookingService.updateBooking("booking-1", request, "user-1", Role.USER);

        assertEquals("Updated purpose", response.getPurpose());
        assertEquals(LocalTime.of(9, 30), response.getStartTime());
        assertEquals(LocalTime.of(10, 30), response.getEndTime());
        assertEquals(8, response.getExpectedAttendees());
        assertEquals(BookingStatus.PENDING, response.getStatus());
    }

    @Test
    void updateBookingRejectsApprovedBooking() {
        Booking approved = booking("booking-1", BookingStatus.APPROVED, "user-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(approved));

        assertThrows(InvalidBookingStateException.class,
                () -> bookingService.updateBooking("booking-1", validRequest(), "user-1", Role.USER));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void cancelBookingOnlyAllowsApprovedBookings() {
        Booking approved = booking("booking-1", BookingStatus.APPROVED, "user-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(approved));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingStatusResponse response = bookingService.cancelBooking("booking-1", "user-1", Role.USER);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    void createBookingRejectsInvalidTimeRange() {
        CreateBookingRequest request = new CreateBookingRequest(
                "RES-101",
                LocalDate.now().plusDays(1),
                LocalTime.of(11, 0),
                LocalTime.of(10, 0),
                "Invalid slot",
                5);

        assertThrows(InvalidBookingStateException.class,
                () -> bookingService.createBooking(request, "user-1", Role.USER));

        verifyNoInteractions(bookingRepository);
    }

    @Test
    void approveBookingRejectsInvalidStatusTransition() {
        Booking approved = booking("booking-1", BookingStatus.APPROVED, "user-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(approved));

        assertThrows(InvalidBookingStateException.class,
                () -> bookingService.approveBooking("booking-1", "admin-1", Role.ADMIN));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void getAvailabilityMarksOverlappingBlockingBookingsAsBooked() {
        LocalDate date = LocalDate.of(2026, 5, 1);
        Resource resource = resource();
        Booking existing = booking("booking-1", BookingStatus.APPROVED, "other-user");
        existing.setDate(date);
        existing.setStartTime(LocalTime.of(9, 0));
        existing.setEndTime(LocalTime.of(10, 0));

        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource));
        when(bookingRepository.findByResourceIdAndDateAndStatusInOrderByStartTimeAsc(
                eq("RES-101"),
                eq(date),
                anyCollection())).thenReturn(List.of(existing));

        var slots = bookingService.getAvailability("RES-101", date);

        assertEquals(3, slots.size());
        assertEquals("08:00", slots.get(0).getStartTime());
        assertEquals("AVAILABLE", slots.get(0).getStatus());
        assertEquals("09:00", slots.get(1).getStartTime());
        assertEquals("BOOKED", slots.get(1).getStatus());
        assertEquals("10:00", slots.get(2).getStartTime());
        assertEquals("AVAILABLE", slots.get(2).getStatus());
    }

    @Test
    void getAvailabilityDoesNotBlockPendingBookings() {
        LocalDate date = LocalDate.of(2026, 5, 1);
        Resource resource = resource();

        when(resourceRepository.findById("RES-101")).thenReturn(Optional.of(resource));
        when(bookingRepository.findByResourceIdAndDateAndStatusInOrderByStartTimeAsc(
                eq("RES-101"),
                eq(date),
                eq(List.of(BookingStatus.APPROVED)))).thenReturn(List.of());

        var slots = bookingService.getAvailability("RES-101", date);

        assertEquals(3, slots.size());
        assertEquals("AVAILABLE", slots.get(0).getStatus());
        assertEquals("AVAILABLE", slots.get(1).getStatus());
        assertEquals("AVAILABLE", slots.get(2).getStatus());
        verify(bookingRepository).findByResourceIdAndDateAndStatusInOrderByStartTimeAsc(
                eq("RES-101"),
                eq(date),
                eq(List.of(BookingStatus.APPROVED)));
    }

    private CreateBookingRequest validRequest() {
        return new CreateBookingRequest(
                "RES-101",
                LocalDate.now().plusDays(1),
                LocalTime.of(9, 0),
                LocalTime.of(11, 0),
                "Study group",
                6);
    }

    private Booking booking(String id, BookingStatus status, String userId) {
        LocalDateTime now = LocalDateTime.now();
        return Booking.builder()
                .id(id)
                .resourceId("RES-101")
                .userId(userId)
                .date(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Study group")
                .expectedAttendees(6)
                .status(status)
                .createdAt(now.minusHours(1))
                .updatedAt(now.minusHours(1))
                .build();
    }

    private Resource resource() {
        return Resource.builder()
                .id("RES-101")
                .name("Test Resource")
                .category("Classroom")
                .type("room")
                .location("Main Building")
                .capacity(25)
                .status(ResourceStatus.ACTIVE)
                .availableDays(null)
                .availableTimes(Map.of("start", "08:00", "end", "11:00"))
                .build();
    }
}

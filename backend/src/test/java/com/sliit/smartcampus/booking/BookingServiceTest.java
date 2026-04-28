package com.sliit.smartcampus.booking;

import com.sliit.smartcampus.dto.booking.BookingReviewRequest;
import com.sliit.smartcampus.dto.booking.BookingStatusResponse;
import com.sliit.smartcampus.dto.booking.CreateBookingRequest;
import com.sliit.smartcampus.exception.booking.BookingConflictException;
import com.sliit.smartcampus.exception.booking.InvalidBookingStateException;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import com.sliit.smartcampus.repository.BookingRepository;
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

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository);
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

        var response = bookingService.createBooking(request, "user-1", Role.USER);

        assertEquals("booking-1", response.getId());
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
    void approveBookingMovesPendingToApproved() {
        Booking pending = booking("booking-1", BookingStatus.PENDING, "user-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(pending));
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
}

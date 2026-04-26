package com.sliit.smartcampus.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserIdOrderByDateDescStartTimeDesc(String userId);

    List<Booking> findByStatusOrderByDateAscStartTimeAsc(BookingStatus status);

    List<Booking> findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            LocalDate date,
            List<BookingStatus> statuses,
            LocalTime requestedEndTime,
            LocalTime requestedStartTime);

    boolean existsByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            LocalDate date,
            List<BookingStatus> statuses,
            LocalTime requestedEndTime,
            LocalTime requestedStartTime);
}

package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            LocalDate date,
            Collection<BookingStatus> statuses,
            LocalTime requestedEndTime,
            LocalTime requestedStartTime);
}

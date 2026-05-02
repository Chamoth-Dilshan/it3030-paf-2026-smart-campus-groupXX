package com.sliit.smartcampus.service;

import com.mongodb.client.result.UpdateResult;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingExpiryScheduler {

    private final MongoTemplate mongoTemplate;

    @Value("${app.time-zone:Asia/Colombo}")
    private String appTimeZone;

    @Transactional
    @Scheduled(
            fixedDelayString = "${app.booking-expiry.fixed-delay-ms:60000}",
            initialDelayString = "${app.booking-expiry.initial-delay-ms:30000}"
    )
    public void completeExpiredApprovedBookings() {
        ZoneId zoneId = ZoneId.of(appTimeZone);
        LocalDate today = LocalDate.now(zoneId);
        LocalTime now = LocalTime.now(zoneId);
        LocalDateTime updatedAt = LocalDateTime.now(zoneId);

        Criteria expiredCriteria = new Criteria().orOperator(
                Criteria.where("date").lt(today),
                new Criteria().andOperator(
                        Criteria.where("date").is(today),
                        Criteria.where("endTime").lte(now)
                )
        );

        Query query = Query.query(new Criteria().andOperator(
                Criteria.where("status").is(BookingStatus.APPROVED),
                expiredCriteria
        ));

        Update update = new Update()
                .set("status", BookingStatus.COMPLETED)
                .set("updatedAt", updatedAt);

        UpdateResult result = mongoTemplate.updateMulti(query, update, Booking.class);

        if (result.getModifiedCount() > 0) {
            log.info("Completed {} expired approved bookings.", result.getModifiedCount());
        }
    }
}

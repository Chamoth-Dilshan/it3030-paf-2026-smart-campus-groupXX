package com.sliit.smartcampus.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.sliit.smartcampus.model.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private int expectedAttendees;
    private BookingStatus status;
    private String reviewReason;
    private String reviewedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

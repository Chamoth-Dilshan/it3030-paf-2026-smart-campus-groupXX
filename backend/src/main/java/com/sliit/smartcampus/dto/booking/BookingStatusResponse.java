package com.sliit.smartcampus.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.sliit.smartcampus.model.BookingStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusResponse {
    private String id;
    private BookingStatus status;
    private String reviewReason;
    private String reviewedBy;
    private LocalDateTime updatedAt;
    private String message;
}

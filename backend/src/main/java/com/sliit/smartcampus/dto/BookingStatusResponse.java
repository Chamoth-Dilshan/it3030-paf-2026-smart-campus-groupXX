package com.sliit.smartcampus.dto;

import java.time.Instant;

import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;

public class BookingStatusResponse {

    private String id;
    private BookingStatus status;
    private String reviewReason;
    private String reviewedBy;
    private Instant updatedAt;

    public BookingStatusResponse() {
    }

    public static BookingStatusResponse fromBooking(Booking booking) {
        BookingStatusResponse response = new BookingStatusResponse();
        response.setId(booking.getId());
        response.setStatus(booking.getStatus());
        response.setReviewReason(booking.getReviewReason());
        response.setReviewedBy(booking.getReviewedBy());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getReviewReason() {
        return reviewReason;
    }

    public void setReviewReason(String reviewReason) {
        this.reviewReason = reviewReason;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

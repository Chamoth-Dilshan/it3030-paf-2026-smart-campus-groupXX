package com.sliit.smartcampus.dto;

import com.sliit.smartcampus.model.BookingStatus;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BookingReviewRequest {

    @NotNull(message = "Review status is required")
    private BookingStatus status;

    @Size(max = 500, message = "Review reason must be 500 characters or less")
    private String reviewReason;

    public BookingReviewRequest() {
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

    @AssertTrue(message = "Review status must be APPROVED or REJECTED")
    public boolean isReviewStatusValid() {
        return status == null || status == BookingStatus.APPROVED || status == BookingStatus.REJECTED;
    }

    @AssertTrue(message = "Review reason is required when rejecting a booking")
    public boolean isRejectReasonValid() {
        return status != BookingStatus.REJECTED || (reviewReason != null && !reviewReason.trim().isEmpty());
    }
}

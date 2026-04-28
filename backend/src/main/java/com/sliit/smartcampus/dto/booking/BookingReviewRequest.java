package com.sliit.smartcampus.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingReviewRequest {

    @NotBlank(message = "Review reason is required")
    @Size(max = 300, message = "Review reason cannot exceed 300 characters")
    private String reason;
}

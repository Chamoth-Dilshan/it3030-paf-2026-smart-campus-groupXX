package com.sliit.smartcampus.dto.ticket;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentRequest {
    @NotBlank(message = "Reporter name is required")
    private String reportedBy;

    @Email(message = "Email must be valid")
    private String email;

    private String registrationNumber;
    private String faculty;
    private String contactNumber;

    @NotBlank(message = "Subject is required")
    private String title;

    private String campus;
    private String category;
    private String resource;

    @NotBlank(message = "Description is required")
    private String description;

    private String priority;
    private Boolean urgent;
    private List<String> proofUrls;
}

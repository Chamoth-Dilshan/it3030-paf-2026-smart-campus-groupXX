package com.sliit.smartcampus.dto.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponse {
    private String id;
    private String referenceId;
    private String reportedBy;
    private String email;
    private String title;
    private String campus;
    private String category;
    private String resource;
    private String description;
    private String priority;
    private LocalDate dateReported;
    private LocalDateTime createdAt;
    private String status;
    private Boolean urgent;
    private List<String> proofUrls;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String assignedTechnicianCategory;
    private List<String> remarksHistory;
    private String rejectionReason;
}

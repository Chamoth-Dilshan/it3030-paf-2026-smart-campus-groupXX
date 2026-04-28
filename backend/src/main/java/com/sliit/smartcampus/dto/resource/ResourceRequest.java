package com.sliit.smartcampus.dto.resource;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequest {
    @NotBlank(message = "Resource name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Resource type is required")
    private String type;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    private String imageUrl;
    private List<String> availableDays;
    private Map<String, String> availableTimes;
    private String status;
    private String managerId;
    private String managerName;
}

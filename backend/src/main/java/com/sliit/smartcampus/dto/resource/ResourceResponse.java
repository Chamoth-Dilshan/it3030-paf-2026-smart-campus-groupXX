package com.sliit.smartcampus.dto.resource;

import com.sliit.smartcampus.model.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private String id;
    private String name;
    private String category;
    private String type;
    private String location;
    private String description;
    private int capacity;
    private String imageUrl;
    private List<String> availableDays;
    private Map<String, String> availableTimes;
    private ResourceStatus status;
    private String managerId;
    private String managerName;
}

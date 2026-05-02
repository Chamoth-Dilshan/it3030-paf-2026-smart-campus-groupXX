package com.sliit.smartcampus.service;

import com.sliit.smartcampus.exception.resource.ResourceNotFoundException;
import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.ResourceStatus;
import com.sliit.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Profile("!mock")
public class MongoResourceService implements ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> getResourcesByCategory(String category) {
        return resourceRepository.findByCategory(category);
    }

    public List<Resource> getFilteredResources(String type, Integer minCapacity, String location, String status, String search) {
        return resourceRepository.findAll().stream()
                .filter(r -> (type == null || type.isEmpty() || equalsIgnoreCase(r.getType(), type)))
                .filter(r -> (minCapacity == null || r.getCapacity() >= minCapacity))
                .filter(r -> (location == null || location.isEmpty() || containsIgnoreCase(r.getLocation(), location)))
                .filter(r -> (status == null || status.isEmpty() || matchesStatus(r.getStatus(), status)))
                .filter(r -> (search == null || search.isEmpty()
                             || containsIgnoreCase(r.getName(), search)
                             || containsIgnoreCase(r.getCategory(), search)
                             || containsIgnoreCase(r.getType(), search)
                             || containsIgnoreCase(r.getLocation(), search)))
                .toList();
    }

    private boolean equalsIgnoreCase(String value, String expected) {
        return value != null && value.equalsIgnoreCase(expected);
    }

    private boolean containsIgnoreCase(String value, String search) {
        return value != null && value.toLowerCase().contains(search.toLowerCase());
    }

    private boolean matchesStatus(ResourceStatus resourceStatus, String requestedStatus) {
        if (resourceStatus == null) {
            return false;
        }
        if ("ACTIVE".equalsIgnoreCase(requestedStatus)) {
            return resourceStatus == ResourceStatus.ACTIVE || resourceStatus == ResourceStatus.AVAILABLE;
        }
        return resourceStatus.name().equalsIgnoreCase(requestedStatus);
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        return resourceRepository.findById(id).map(resource -> {
            resource.setName(resourceDetails.getName());
            resource.setCategory(resourceDetails.getCategory());
            resource.setType(resourceDetails.getType());
            resource.setLocation(resourceDetails.getLocation());
            resource.setDescription(resourceDetails.getDescription());
            resource.setCapacity(resourceDetails.getCapacity());
            resource.setImageUrl(resourceDetails.getImageUrl());
            resource.setAvailableDays(resourceDetails.getAvailableDays());
            resource.setAvailableTimes(resourceDetails.getAvailableTimes());
            resource.setStatus(resourceDetails.getStatus());
            resource.setManagerId(resourceDetails.getManagerId());
            resource.setManagerName(resourceDetails.getManagerName());
            return resourceRepository.save(resource);
        }).orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }
}

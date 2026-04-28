package com.sliit.smartcampus.resource;

import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.ResourceStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ResourceModelTest {
    @Test
    void builderStoresResourceDetails() {
        Resource resource = Resource.builder()
                .id("resource-1")
                .name("Computer Lab")
                .category("Laboratory")
                .type("ROOM")
                .location("Block A")
                .capacity(35)
                .status(ResourceStatus.AVAILABLE)
                .build();

        assertEquals("Computer Lab", resource.getName());
        assertEquals("Laboratory", resource.getCategory());
        assertEquals(ResourceStatus.AVAILABLE, resource.getStatus());
    }
}

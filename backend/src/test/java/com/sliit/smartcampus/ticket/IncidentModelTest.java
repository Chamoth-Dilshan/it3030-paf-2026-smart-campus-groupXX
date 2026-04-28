package com.sliit.smartcampus.ticket;

import com.sliit.smartcampus.model.Incident;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class IncidentModelTest {
    @Test
    void urgentDefaultsToFalseWhenUnset() {
        Incident incident = new Incident();
        incident.setTitle("Projector issue");
        incident.setProofUrls(List.of("/uploads/proof.png"));

        assertFalse(incident.getUrgent());
        assertEquals("Projector issue", incident.getTitle());
        assertEquals(1, incident.getProofUrls().size());
    }
}

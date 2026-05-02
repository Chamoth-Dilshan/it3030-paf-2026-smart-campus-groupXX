package com.sliit.smartcampus.booking;

import com.mongodb.client.result.UpdateResult;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.BookingStatus;
import com.sliit.smartcampus.service.BookingExpiryScheduler;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.UpdateDefinition;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingExpirySchedulerTest {

    @Mock
    private MongoTemplate mongoTemplate;

    private BookingExpiryScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new BookingExpiryScheduler(mongoTemplate);
        ReflectionTestUtils.setField(scheduler, "appTimeZone", "Asia/Colombo");
    }

    @Test
    void completeExpiredApprovedBookingsMarksMatchingBookingsCompletedInBulk() {
        when(mongoTemplate.updateMulti(
                org.mockito.ArgumentMatchers.any(Query.class),
                org.mockito.ArgumentMatchers.any(UpdateDefinition.class),
                eq(Booking.class))).thenReturn(UpdateResult.acknowledged(2, 2L, null));

        scheduler.completeExpiredApprovedBookings();

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<UpdateDefinition> updateCaptor = ArgumentCaptor.forClass(UpdateDefinition.class);
        verify(mongoTemplate).updateMulti(queryCaptor.capture(), updateCaptor.capture(), eq(Booking.class));

        Document queryDocument = queryCaptor.getValue().getQueryObject();
        assertTrue(containsKey(queryDocument, "status"));
        assertTrue(containsValue(queryDocument, BookingStatus.APPROVED));
        assertTrue(containsKey(queryDocument, "date"));
        assertTrue(containsKey(queryDocument, "endTime"));

        Document setDocument = updateCaptor.getValue().getUpdateObject().get("$set", Document.class);
        assertEquals(BookingStatus.COMPLETED, setDocument.get("status"));
        assertNotNull(setDocument.get("updatedAt"));
    }

    private boolean containsKey(Object value, String expectedKey) {
        if (value instanceof Map<?, ?> map) {
            return map.containsKey(expectedKey)
                    || map.values().stream().anyMatch(child -> containsKey(child, expectedKey));
        }
        if (value instanceof List<?> list) {
            return list.stream().anyMatch(child -> containsKey(child, expectedKey));
        }
        return false;
    }

    private boolean containsValue(Object value, Object expectedValue) {
        if (expectedValue.equals(value)) {
            return true;
        }
        if (value instanceof Map<?, ?> map) {
            return map.values().stream().anyMatch(child -> containsValue(child, expectedValue));
        }
        if (value instanceof List<?> list) {
            return list.stream().anyMatch(child -> containsValue(child, expectedValue));
        }
        return false;
    }
}

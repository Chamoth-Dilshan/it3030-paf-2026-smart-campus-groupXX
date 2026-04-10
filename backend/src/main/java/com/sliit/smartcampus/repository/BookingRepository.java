package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {
}

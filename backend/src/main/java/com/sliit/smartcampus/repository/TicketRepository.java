package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
}

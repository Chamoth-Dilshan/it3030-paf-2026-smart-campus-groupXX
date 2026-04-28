package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Technician;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TechnicianRepository extends MongoRepository<Technician, String> {
}

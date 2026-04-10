package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}

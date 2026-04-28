package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByCategory(String category);
    List<Resource> findByStatus(com.sliit.smartcampus.model.ResourceStatus status);
}

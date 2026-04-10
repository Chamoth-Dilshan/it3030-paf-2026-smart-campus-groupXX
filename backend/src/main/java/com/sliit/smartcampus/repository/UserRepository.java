package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
}

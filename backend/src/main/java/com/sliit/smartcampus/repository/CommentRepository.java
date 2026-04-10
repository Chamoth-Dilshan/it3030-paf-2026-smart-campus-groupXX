package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommentRepository extends MongoRepository<Comment, String> {
}

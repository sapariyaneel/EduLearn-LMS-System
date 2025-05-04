package com.elearn.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elearn.model.Video;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByCourseId(Long courseId);
} 
package com.elearn.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elearn.model.Courses;
import com.elearn.model.User;
import com.elearn.model.Courses.CourseStatus;

@Repository
public interface CoursesRepo extends JpaRepository<Courses, Long> {
    List<Courses> findByInstructor(User instructor);
    List<Courses> findByCategoryId(Integer categoryId);
    List<Courses> findByStatus(CourseStatus status);
    List<Courses> findByInstructorId(Long instructorId);
} 
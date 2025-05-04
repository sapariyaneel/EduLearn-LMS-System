package com.elearn.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elearn.model.Courses;
import com.elearn.model.Enrollment;
import com.elearn.model.User;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUser(User user);
    List<Enrollment> findByCourse(Courses course);
    boolean existsByUserAndCourse(User user, Courses course);
} 
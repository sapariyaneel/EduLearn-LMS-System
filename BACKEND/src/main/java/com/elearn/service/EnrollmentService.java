package com.elearn.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elearn.model.Courses;
import com.elearn.model.Enrollment;
import com.elearn.model.User;
import com.elearn.model.Enrollment.EnrollmentStatus;
import com.elearn.repository.CoursesRepo;
import com.elearn.repo.EnrollmentRepository;
import com.elearn.repo.UserRepository;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CoursesRepo coursesRepo;
    
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }
    
    public List<Enrollment> getEnrollmentsByUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            return enrollmentRepository.findByUser(userOpt.get());
        }
        return List.of();
    }
    
    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        Optional<Courses> courseOpt = coursesRepo.findById(courseId);
        if (courseOpt.isPresent()) {
            return enrollmentRepository.findByCourse(courseOpt.get());
        }
        return List.of();
    }
    
    public Optional<Enrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }
    
    public Enrollment enrollUserInCourse(Long userId, Long courseId) {
        // Check if user and course exist
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Courses> courseOpt = coursesRepo.findById(courseId);
        
        if (userOpt.isPresent() && courseOpt.isPresent()) {
            User user = userOpt.get();
            Courses course = courseOpt.get();
            
            // Check if enrollment already exists
            boolean exists = enrollmentRepository.existsByUserAndCourse(user, course);
            if (exists) {
                throw new RuntimeException("User is already enrolled in this course");
            }
            
            // Create new enrollment
            Enrollment enrollment = new Enrollment();
            enrollment.setUser(user);
            enrollment.setCourse(course);
            enrollment.setEnrollmentDate(LocalDateTime.now());
            enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
            
            return enrollmentRepository.save(enrollment);
        }
        
        throw new RuntimeException("User or course not found");
    }
    
    public Enrollment updateEnrollmentStatus(Long enrollmentId, EnrollmentStatus status) {
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(enrollmentId);
        
        if (enrollmentOpt.isPresent()) {
            Enrollment enrollment = enrollmentOpt.get();
            enrollment.setStatus(status);
            
            // If status is completed, set completion date
            if (status == EnrollmentStatus.COMPLETED) {
                enrollment.setCompletionDate(LocalDateTime.now());
            }
            
            return enrollmentRepository.save(enrollment);
        }
        
        return null;
    }
    
    public Enrollment updateEnrollment(Enrollment enrollment) {
        return enrollmentRepository.save(enrollment);
    }
    
    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }
} 
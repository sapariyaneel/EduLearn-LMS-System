package com.elearn.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elearn.model.Enrollment;
import com.elearn.model.Enrollment.EnrollmentStatus;
import com.elearn.service.EnrollmentService;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:4200", "https://edulearn-lms.netlify.app", "https://www.edulearn-lms.netlify.app"})
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;
    
    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
        return ResponseEntity.ok(enrollments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getEnrollmentById(@PathVariable Long id) {
        Optional<Enrollment> enrollmentOpt = enrollmentService.getEnrollmentById(id);
        
        if (enrollmentOpt.isPresent()) {
            return ResponseEntity.ok(enrollmentOpt.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Enrollment not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByUser(@PathVariable Long userId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByUser(userId);
        return ResponseEntity.ok(enrollments);
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        return ResponseEntity.ok(enrollments);
    }
    
    @PostMapping
    public ResponseEntity<?> enrollUserInCourse(@RequestBody Map<String, Object> enrollmentData) {
        try {
            Long userId;
            Long courseId;
            
            // Handle userId which might be a string or long
            if (enrollmentData.get("userId") instanceof String) {
                userId = Long.parseLong((String) enrollmentData.get("userId"));
            } else if (enrollmentData.get("userId") instanceof Number) {
                userId = ((Number) enrollmentData.get("userId")).longValue();
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User ID is required and must be a number");
                return ResponseEntity.status(400).body(response);
            }
            
            // Handle courseId which might be a string or long
            if (enrollmentData.get("courseId") instanceof String) {
                courseId = Long.parseLong((String) enrollmentData.get("courseId"));
            } else if (enrollmentData.get("courseId") instanceof Number) {
                courseId = ((Number) enrollmentData.get("courseId")).longValue();
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Course ID is required and must be a number");
                return ResponseEntity.status(400).body(response);
            }
            
            if (userId == null || courseId == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User ID and Course ID are required");
                return ResponseEntity.status(400).body(response);
            }
            
            // If status is provided, use it (otherwise default will be used)
            EnrollmentStatus status = null;
            if (enrollmentData.containsKey("status") && enrollmentData.get("status") != null) {
                try {
                    // Validate the status string explicitly
                    String statusStr = enrollmentData.get("status").toString().toUpperCase();
                    boolean isValidStatus = false;
                    
                    // Check against each valid enum value
                    for (EnrollmentStatus validStatus : EnrollmentStatus.values()) {
                        if (validStatus.name().equals(statusStr)) {
                            status = validStatus;
                            isValidStatus = true;
                            break;
                        }
                    }
                    
                    if (!isValidStatus) {
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Invalid enrollment status. Valid values are: " + 
                            Arrays.stream(EnrollmentStatus.values())
                                .map(Enum::name)
                                .collect(Collectors.joining(", ")));
                        return ResponseEntity.status(400).body(response);
                    }
                } catch (IllegalArgumentException e) {
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Invalid enrollment status");
                    return ResponseEntity.status(400).body(response);
                }
            }
            
            Enrollment enrollment = enrollmentService.enrollUserInCourse(userId, courseId);
            
            // Set status if provided
            if (status != null) {
                enrollment.setStatus(status);
                enrollment = enrollmentService.updateEnrollment(enrollment);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
        } catch (NumberFormatException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid ID format: " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateEnrollmentStatus(@PathVariable Long id, @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            if (status == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Status is required");
                return ResponseEntity.status(400).body(response);
            }
            
            EnrollmentStatus enrollmentStatus = EnrollmentStatus.valueOf(status.toUpperCase());
            Enrollment updatedEnrollment = enrollmentService.updateEnrollmentStatus(id, enrollmentStatus);
            
            if (updatedEnrollment != null) {
                return ResponseEntity.ok(updatedEnrollment);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Enrollment not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid status value");
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnrollment(@PathVariable Long id) {
        try {
            enrollmentService.deleteEnrollment(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Enrollment deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 
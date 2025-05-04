package com.elearn.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
// import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.elearn.model.Courses;
import com.elearn.model.Courses.CourseStatus;
import com.elearn.model.User;
import com.elearn.model.Category;
import com.elearn.service.CourseService;
import com.elearn.service.UserService;
import com.elearn.service.CategoryService;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:4200", "https://edulearn-lms.netlify.app", "https://www.edulearn-lms.netlify.app"})
public class CourseController {

    @Autowired
    private CourseService courseService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<Courses>> getAllCourses() {
        List<Courses> courses = courseService.getAllCourses();
        
        // Fetch all categories to improve performance (avoid multiple DB queries)
        List<Category> allCategories = categoryService.getAllCategories();
        
        // Create a map of category IDs to categories for quick lookup
        Map<Integer, Category> categoryMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, category -> category));
        
        // This doesn't modify the courses in the database, just enhances the response
        for (Courses course : courses) {
            if (course.getCategoryId() != null && categoryMap.containsKey(course.getCategoryId())) {
                // We don't set the category directly as there's no field, but we could add it to a transient field
                // For now, let's ensure the categoryId is passed correctly
                course.setCategoryId(course.getCategoryId());
            }
        }
        
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        Optional<Courses> courseOpt = courseService.getCourseById(id);
        
        if (courseOpt.isPresent()) {
            Courses course = courseOpt.get();
            
            // Add category information if categoryId exists
            if (course.getCategoryId() != null) {
                Optional<Category> categoryOpt = categoryService.getCategoryById(course.getCategoryId());
                if (categoryOpt.isPresent()) {
                    // We just need to ensure the categoryId is available
                    course.setCategoryId(course.getCategoryId());
                }
            }
            
            return ResponseEntity.ok(course);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Course not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<?> getCoursesByInstructor(@PathVariable Long instructorId) {
        Optional<User> instructorOpt = userService.getUserById(instructorId);
        
        if (instructorOpt.isPresent()) {
            User instructor = instructorOpt.get();
            List<Courses> courses = courseService.getCoursesByInstructor(instructor);
            return ResponseEntity.ok(courses);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Instructor not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Courses>> getCoursesByCategory(@PathVariable Integer categoryId) {
        List<Courses> courses = courseService.getCoursesByCategory(categoryId);
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getCoursesByStatus(@PathVariable String status) {
        try {
            CourseStatus courseStatus = CourseStatus.valueOf(status.toUpperCase());
            List<Courses> courses = courseService.getCoursesByStatus(courseStatus);
            return ResponseEntity.ok(courses);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid status value");
            return ResponseEntity.status(400).body(response);
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createCourse(
            @RequestPart(value = "course", required = true) Courses course,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        
        try {
            // Check if course object is empty/null
            if (course == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Course data is required");
                return ResponseEntity.status(400).body(response);
            }
            
            // Check if instructor is set
            if (course.getInstructor() == null || course.getInstructor().getId() == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Instructor ID is required");
                return ResponseEntity.status(400).body(response);
            }
            
            // Verify instructor exists
            Optional<User> instructorOpt = userService.getUserById(course.getInstructor().getId());
            if (!instructorOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Instructor not found");
                return ResponseEntity.status(400).body(response);
            }
            
            // Set the actual instructor entity
            course.setInstructor(instructorOpt.get());
            
            Courses savedCourse = courseService.createCourse(course, thumbnail);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCourse);
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error uploading thumbnail: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error creating course: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestPart("course") Courses course,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        
        try {
            // Ensure the ID in the path matches the course object
            course.setId(id);
            
            // Verify instructor exists
            Optional<User> instructorOpt = userService.getUserById(course.getInstructor().getId());
            if (!instructorOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Instructor not found");
                return ResponseEntity.status(400).body(response);
            }
            
            // Set the actual instructor entity
            course.setInstructor(instructorOpt.get());
            
            Courses updatedCourse = courseService.updateCourse(course, thumbnail);
            
            if (updatedCourse != null) {
                return ResponseEntity.ok(updatedCourse);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Course not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error uploading thumbnail: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCourseStatus(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> statusData) {
        
        try {
            String statusStr = statusData.get("status");
            if (statusStr == null || statusStr.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Status is required");
                return ResponseEntity.status(400).body(response);
            }
            
            CourseStatus courseStatus;
            try {
                courseStatus = CourseStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid status value. Valid values are: " + 
                    Arrays.stream(CourseStatus.values())
                        .map(Enum::name)
                        .collect(Collectors.joining(", ")));
                return ResponseEntity.status(400).body(response);
            }
            
            Optional<Courses> courseOpt = courseService.getCourseById(id);
            if (!courseOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Course not found");
                return ResponseEntity.status(404).body(response);
            }
            
            Courses course = courseOpt.get();
            course.setStatus(courseStatus);
            
            Courses updatedCourse = courseService.updateCourse(course, null);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error updating course status: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Course deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 
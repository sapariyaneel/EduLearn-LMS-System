package com.elearn.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.elearn.model.Courses;
import com.elearn.model.User;
import com.elearn.repository.CoursesRepo;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class CourseService {

    @Autowired
    private CoursesRepo coursesRepo;
    
    @Value("${aws.s3.bucket.name}")
    private String bucketName;
    
    @Value("${aws.accessKeyId}")
    private String accessKeyId;
    
    @Value("${aws.secretAccessKey}")
    private String secretAccessKey;
    
    @Value("${aws.s3.region}")
    private String region;
    
    private S3Client getS3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                ))
                .build();
    }
    
    public List<Courses> getAllCourses() {
        return coursesRepo.findAll();
    }
    
    public List<Courses> getCoursesByInstructor(User instructor) {
        return coursesRepo.findByInstructor(instructor);
    }
    
    public List<Courses> getCoursesByCategory(Integer categoryId) {
        return coursesRepo.findByCategoryId(categoryId);
    }
    
    public List<Courses> getCoursesByStatus(Courses.CourseStatus status) {
        return coursesRepo.findByStatus(status);
    }
    
    public Optional<Courses> getCourseById(Long id) {
        return coursesRepo.findById(id);
    }
    
    public Courses createCourse(Courses course, MultipartFile thumbnailFile) throws IOException {
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            String thumbnailUrl = uploadFile(thumbnailFile);
            course.setThumbnail(thumbnailUrl);
        }
        
        // Set timestamps
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        
        return coursesRepo.save(course);
    }
    
    public Courses updateCourse(Courses course, MultipartFile thumbnailFile) throws IOException {
        Optional<Courses> existingCourseOpt = coursesRepo.findById(course.getId());
        
        if (existingCourseOpt.isPresent()) {
            Courses existingCourse = existingCourseOpt.get();
            
            // Only update the thumbnail if a new file is provided
            if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
                String thumbnailUrl = uploadFile(thumbnailFile);
                course.setThumbnail(thumbnailUrl);
            } else {
                // Keep the existing thumbnail
                course.setThumbnail(existingCourse.getThumbnail());
            }
            
            // Preserve creation timestamp
            course.setCreatedAt(existingCourse.getCreatedAt());
            // Update the updated timestamp
            course.setUpdatedAt(LocalDateTime.now());
            
            return coursesRepo.save(course);
        }
        
        return null;
    }
    
    public void deleteCourse(Long id) {
        coursesRepo.deleteById(id);
    }
    
    private String uploadFile(MultipartFile file) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        
        try {
            // Upload to S3
            getS3Client().putObject(
                PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build(),
                RequestBody.fromBytes(file.getBytes())
            );
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file to S3: " + e.getMessage());
        }
        
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    public List<Courses> getCoursesByInstructorId(Long instructorId) {
        return coursesRepo.findByInstructorId(instructorId);
    }
} 
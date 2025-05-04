package com.elearn.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import jakarta.persistence.EntityNotFoundException;

import com.elearn.model.Courses;
import com.elearn.model.Video;
import com.elearn.service.CourseService;
import com.elearn.service.VideoService;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "*")
public class VideoController {

    @Autowired
    private VideoService videoService;
    
    @Autowired
    private CourseService courseService;
    
    @GetMapping
    public ResponseEntity<List<Video>> getAllVideos() {
        List<Video> videos = videoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Video> getVideoById(@PathVariable Long id) {
        try {
            Video video = videoService.getVideoById(id);
            return ResponseEntity.ok(video);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Video>> getVideosByCourseId(@PathVariable Long courseId) {
        List<Video> videos = videoService.getVideosByCourseId(courseId);
        return ResponseEntity.ok(videos);
    }
    
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Video>> getVideosByInstructorId(@PathVariable Long instructorId) {
        try {
            // Get all courses for this instructor
            List<Courses> instructorCourses = courseService.getCoursesByInstructorId(instructorId);
            
            // Get videos for all instructor courses
            List<Video> videos = new ArrayList<>();
            for (Courses course : instructorCourses) {
                videos.addAll(videoService.getVideosByCourseId(course.getId()));
            }
            
            return ResponseEntity.ok(videos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Video> createVideo(@RequestBody Map<String, Object> payload) {
        try {
            // Extract data from payload
            String title = (String) payload.get("title");
            String description = (String) payload.get("description");
            String videoLink = (String) payload.get("videoLink");
            String notesLink = (String) payload.get("notesLink");
            Integer courseId = (Integer) payload.get("courseId");
            
            // Get course
            Courses course = courseService.getCourseById(courseId.longValue())
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));
            
            // Create video
            Video video = new Video();
            video.setTitle(title);
            video.setDescription(description);
            video.setVideoLink(videoLink);
            video.setNotesLink(notesLink);
            video.setCourse(course);
            
            Video createdVideo = videoService.createVideo(video);
            return ResponseEntity.ok(createdVideo);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Video> updateVideo(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            // Extract data from payload
            String title = (String) payload.get("title");
            String description = (String) payload.get("description");
            String videoLink = (String) payload.get("videoLink");
            String notesLink = (String) payload.get("notesLink");
            Integer courseId = (Integer) payload.get("courseId");
            
            // Get course
            Courses course = courseService.getCourseById(courseId.longValue())
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));
            
            // Create video details
            Video videoDetails = new Video();
            videoDetails.setTitle(title);
            videoDetails.setDescription(description);
            videoDetails.setVideoLink(videoLink);
            videoDetails.setNotesLink(notesLink);
            videoDetails.setCourse(course);
            
            Video updatedVideo = videoService.updateVideo(id, videoDetails);
            return ResponseEntity.ok(updatedVideo);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteVideo(@PathVariable Long id) {
        try {
            videoService.deleteVideo(id);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", true);
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 
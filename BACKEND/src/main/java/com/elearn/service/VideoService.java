package com.elearn.service;

import java.util.List;

import com.elearn.model.Video;

public interface VideoService {
    List<Video> getAllVideos();
    
    List<Video> getVideosByCourseId(Long courseId);
    
    Video getVideoById(Long id);
    
    Video createVideo(Video video);
    
    Video updateVideo(Long id, Video video);
    
    void deleteVideo(Long id);
} 
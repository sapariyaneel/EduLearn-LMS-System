package com.elearn.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elearn.model.Video;
import com.elearn.repository.VideoRepository;
import com.elearn.service.VideoService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class VideoServiceImpl implements VideoService {

    @Autowired
    private VideoRepository videoRepository;

    @Override
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    @Override
    public List<Video> getVideosByCourseId(Long courseId) {
        return videoRepository.findByCourseId(courseId);
    }

    @Override
    public Video getVideoById(Long id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Video not found with id: " + id));
    }

    @Override
    public Video createVideo(Video video) {
        video.setCreatedAt(LocalDateTime.now());
        video.setUpdatedAt(LocalDateTime.now());
        return videoRepository.save(video);
    }

    @Override
    public Video updateVideo(Long id, Video videoDetails) {
        Video video = getVideoById(id);
        
        video.setTitle(videoDetails.getTitle());
        video.setDescription(videoDetails.getDescription());
        video.setVideoLink(videoDetails.getVideoLink());
        video.setNotesLink(videoDetails.getNotesLink());
        video.setCourse(videoDetails.getCourse());
        video.setUpdatedAt(LocalDateTime.now());
        
        return videoRepository.save(video);
    }

    @Override
    public void deleteVideo(Long id) {
        Video video = getVideoById(id);
        videoRepository.delete(video);
    }
} 
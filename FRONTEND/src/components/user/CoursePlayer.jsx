import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { videoService, enrollmentService } from '../../services/api';
import { motion } from 'framer-motion';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = location.state || {};
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Poll for updates every 30 seconds
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [courseId]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Please log in to view this course');
        setLoading(false);
        return;
      }
      
      // Get course videos
      const videosResponse = await videoService.getVideosByCourseId(course?.id);
      const videosData = videosResponse.data || [];
      setVideos(videosData);
      
      // Get user enrollment for this course
      const enrollmentsResponse = await enrollmentService.getAllEnrollments();
      const userEnrollments = enrollmentsResponse.data.filter(
        e => {
          const enrollmentUserId = e.userId || (e.user && e.user.id);
          const enrollmentCourseId = e.courseId || (e.course && e.course.id);
          
          return enrollmentUserId?.toString() === userId?.toString() && 
                 enrollmentCourseId?.toString() === course?.id?.toString();
        }
      );
      
      if (userEnrollments.length > 0) {
        const userEnrollment = userEnrollments[0];
        setEnrollment(userEnrollment);
        setEnrollmentId(userEnrollment.id);
        
        // Get completed videos from local storage first if available
        const storedCompletedVideos = localStorage.getItem(`completedVideos_${course?.id}`);
        const storedProgress = localStorage.getItem(`progress_${course?.id}`);
        
        if (storedCompletedVideos) {
          const parsedVideos = JSON.parse(storedCompletedVideos);
          setCompletedVideos(parsedVideos);
          
          // If we have completed videos, calculate progress
          if (videosData.length > 0) {
            const calculatedProgress = Math.round((parsedVideos.length / videosData.length) * 100);
            setProgress(calculatedProgress);
          }
        } else if (userEnrollment.completedVideos) {
          // Fall back to server data if no local storage
          const completedVids = userEnrollment.completedVideos.split(',').map(id => parseInt(id));
          setCompletedVideos(completedVids);
          localStorage.setItem(`completedVideos_${course?.id}`, JSON.stringify(completedVids));
          
          if (videosData.length > 0) {
            const calculatedProgress = Math.round((completedVids.length / videosData.length) * 100);
            setProgress(calculatedProgress);
            localStorage.setItem(`progress_${course?.id}`, calculatedProgress.toString());
          }
        } else if (storedProgress) {
          // Use stored progress if available
          setProgress(parseInt(storedProgress));
        } else {
          // Set based on enrollment status
          let currentProgress = userEnrollment.progress || 0;
          setProgress(currentProgress);
          localStorage.setItem(`progress_${course?.id}`, currentProgress.toString());
        }
        
        // Check if course is completed
        if (progress >= 100 && userEnrollment.status !== 'COMPLETED') {
          await enrollmentService.updateEnrollmentStatus(userEnrollment.id, 'COMPLETED');
          
          // Navigate to certificate
          navigate(`/certificate/${course.id}`, {
            state: {
              course: {
                id: course.id,
                courseName: course.courseName,
                instructor: course.instit || 'Expert Instructor',
              },
              userName: localStorage.getItem('name')
            }
          });
          return;
        }
        
        // Set current video - either the first incomplete video or the first video
        if (videosData.length > 0) {
          const firstIncompleteVideo = videosData.find(v => !completedVideos.includes(v.id));
          setCurrentVideo(firstIncompleteVideo || videosData[0]);
        }
      } else {
        // No enrollment found, redirect to course detail
        setError('You are not enrolled in this course');
        setTimeout(() => {
          navigate('/coursedetail', { state: { course } });
        }, 3000);
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Failed to load course content. Please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const markVideoComplete = async (videoId) => {
    try {
      if (!enrollment) return;
      
      let updatedCompletedVideos = [...completedVideos];
      if (!completedVideos.includes(videoId)) {
        updatedCompletedVideos.push(videoId);
        setCompletedVideos(updatedCompletedVideos);
        
        // Update local storage
        localStorage.setItem(`completedVideos_${course?.id}`, JSON.stringify(updatedCompletedVideos));
      }
      
      // Calculate new progress
      const newProgress = Math.round((updatedCompletedVideos.length / videos.length) * 100);
      setProgress(newProgress);
      
      // Update local storage
      localStorage.setItem(`progress_${course?.id}`, newProgress.toString());
      
      // Update enrollment status if all videos are completed
      let newStatus = enrollment.status;
      if (newProgress >= 100) {
        newStatus = 'COMPLETED';
        await enrollmentService.updateEnrollmentStatus(enrollment.id, 'COMPLETED');
        
        // Navigate to certificate
        navigate(`/certificate/${course.id}`, {
          state: {
            course: {
              id: course.id,
              courseName: course.courseName,
              instructor: course.instit || 'Expert Instructor'
            },
            userName: localStorage.getItem('name')
          }
        });
        return;
      }
      
      // Update enrollment in backend (in a real app, you would have an API endpoint for this)
      try {
        await axios.put(`/api/enrollments/${enrollment.id}/progress`, {
          progress: newProgress,
          completedVideos: updatedCompletedVideos.join(',')
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (progressError) {
        console.error('Failed to update progress:', progressError);
        // Continue anyway - this is just tracking
      }
    } catch (err) {
      console.error('Error marking video as complete:', err);
    }
  };

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    // Automatically mark as complete when selected
    markVideoComplete(video.id);
  };

  const handleVideoEnd = () => {
    if (!currentVideo) return;
    
    // Mark current video as complete
    markVideoComplete(currentVideo.id);
    
    // Move to next video if available
    const currentIndex = videos.findIndex(v => v.id === currentVideo.id);
    if (currentIndex < videos.length - 1) {
      const nextVideo = videos[currentIndex + 1];
      setCurrentVideo(nextVideo);
    }
  };

  // Helper function to format video URLs correctly for embedding
  const getEmbedUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Fallback embed
    
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Extract video ID from YouTube URL
      let videoId = '';
      
      try {
        if (url.includes('youtube.com/watch')) {
          // Format: https://youtube.com/watch?v=VIDEO_ID
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get('v');
        } else if (url.includes('youtu.be/')) {
          // Format: https://youtu.be/VIDEO_ID
          const urlParts = url.split('/');
          // Get the last part of the URL and remove any query parameters
          videoId = urlParts[urlParts.length - 1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
          // Already in embed format, extract the ID anyway to standardize
          const urlParts = url.split('/');
          videoId = urlParts[urlParts.length - 1].split('?')[0];
        } else if (url.includes('youtube.com/v/')) {
          // Old format: youtube.com/v/VIDEO_ID
          const urlParts = url.split('/');
          videoId = urlParts[urlParts.length - 1].split('?')[0];
        }
        
        if (videoId) {
          // Add parameters for better embedding experience and for autoplay
          return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&autoplay=1&onStateChange=onYouTubePlayerStateChange`;
        }
      } catch (error) {
        console.error("Error parsing YouTube URL:", error);
      }
    }
    
    // For other video providers or direct video links, return as is
    return url;
  };

  if (loading && videos.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Video Player Column */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            {currentVideo ? (
              <>
                <div className="ratio ratio-16x9">
                  <iframe
                    src={getEmbedUrl(currentVideo.videoLink)}
                    title={currentVideo.title}
                    allowFullScreen
                    className="rounded-top"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onEnded={handleVideoEnd}
                  ></iframe>
                </div>
                <div className="bg-light p-2 text-center">
                  <a 
                    href={currentVideo.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i>
                    Open in New Tab
                  </a>
                  <small className="d-block text-muted mt-1">
                    If the video doesn't load, click above to view it directly
                  </small>
                </div>
              </>
            ) : (
              <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <i className="bi bi-film fs-1 text-muted"></i>
                  <p className="mt-2">No video selected</p>
                </div>
              </div>
            )}
            
            <div className="card-body">
              <h4 className="card-title">{currentVideo?.title || course?.courseName || 'Video Title'}</h4>
              <p className="card-text">{currentVideo?.description || 'No description available for this video.'}</p>
              
              {currentVideo?.notesLink && (
                <a 
                  href={currentVideo.notesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary mt-2"
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Download Notes
                </a>
              )}
              
              <div className="mt-4">
                <h5 className="mb-3">Course Progress</h5>
                <div className="progress mb-2" style={{ height: '10px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${progress}%` }} 
                    aria-valuenow={progress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">{completedVideos.length} of {videos.length} completed</small>
                  <small className="text-muted">{progress}% complete</small>
                </div>
                
                {progress >= 100 && (
                  <div className="alert alert-success mt-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-trophy-fill me-2 fs-4"></i>
                      <div>
                        <strong>Congratulations!</strong> You have completed this course.
                        <div className="mt-2">
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => navigate(`/certificate/${course.id}`, {
                              state: {
                                course: {
                                  id: course.id,
                                  courseName: course.courseName,
                                  instructor: course.instit || 'Expert Instructor'
                                },
                                userName: localStorage.getItem('name')
                              }
                            })}
                          >
                            <i className="bi bi-award me-2"></i>
                            View Your Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {currentVideo?.notesLink && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">Course Materials</h5>
                <div className="mt-3">
                  <a 
                    href={currentVideo.notesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    Download Notes
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Video List Column */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Course Content</h5>
              <div className="text-muted small mt-1">
                {videos.length} videos • {Math.round(videos.length * 10 / 60)} hours
              </div>
            </div>
            <div className="list-group list-group-flush">
              {videos.length === 0 ? (
                <div className="list-group-item text-center py-4">
                  <i className="bi bi-exclamation-circle text-muted fs-4"></i>
                  <p className="mb-0 mt-2">No videos available for this course yet</p>
                </div>
              ) : (
                videos.map((video, index) => (
                  <motion.button
                    key={video.id}
                    className={`list-group-item list-group-item-action ${currentVideo?.id === video.id ? 'active' : ''}`}
                    onClick={() => handleVideoSelect(video)}
                    whileHover={{ backgroundColor: '#f8f9fa' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="d-flex w-100 justify-content-between align-items-center">
                      <div>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {completedVideos.includes(video.id) ? (
                              <i className="bi bi-check-circle-fill text-success"></i>
                            ) : currentVideo?.id === video.id ? (
                              <i className="bi bi-play-circle-fill text-primary"></i>
                            ) : (
                              <span className="badge rounded-pill bg-light text-dark">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-0">{video.title}</h6>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {Math.floor(Math.random() * 10) + 5} min
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
            <div className="card-footer bg-white">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate('/userdashboard/my-enrollments')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to My Enrollments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer; 
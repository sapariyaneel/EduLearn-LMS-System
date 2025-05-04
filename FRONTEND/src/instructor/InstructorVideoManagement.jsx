import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { videoService, courseService } from '../services/api';
import axios from 'axios';

const InstructorVideoManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoLink: '',
    notesLink: '',
    courseId: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check for edit param in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const editVideoId = queryParams.get('edit');
    
    if (editVideoId && videos.length > 0) {
      const videoToEdit = videos.find(v => v.id.toString() === editVideoId);
      if (videoToEdit) {
        openEditVideoModal(videoToEdit);
      }
    }
  }, [location.search, videos]);

  // Add/remove modal-open class to body
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
      // Add overflow-hidden to prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
      // Add padding-right to prevent layout shift when scrollbar disappears
      document.body.style.paddingRight = '15px';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isModalOpen]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates every 30 seconds
    const intervalId = setInterval(() => {
      fetchData(false); // Don't show loading indicator for poll updates
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch all necessary data
  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const instructorId = localStorage.getItem('userId');
      
      // Fetch courses for this instructor using the dedicated method
      const coursesResponse = await courseService.getCoursesByInstructor(instructorId);
      const instructorCourses = coursesResponse.data;
      setInstructorCourses(instructorCourses);
      
      // If no courses, set empty videos and stop loading
      if (instructorCourses.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }
      
      // Use the fallback function to fetch videos
      const instructorVideos = await fetchInstructorVideosWithFallback(instructorId);
      
      // Sort videos by most recently created/updated
      const sortedVideos = [...instructorVideos].sort((a, b) => 
        new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0)
      );
      
      setVideos(sortedVideos);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load video data. Please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Filter videos based on search term and selected course
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const videoCourseId = video.course?.id || video.courseId;
    const matchesCourse = selectedCourse === 'all' || 
                          videoCourseId?.toString() === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  // Handle input change in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal for creating a new video
  const openAddVideoModal = () => {
    setCurrentVideo(null);
    setFormData({
      title: '',
      description: '',
      videoLink: '',
      notesLink: '',
      courseId: instructorCourses.length > 0 ? instructorCourses[0].id : ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing a video
  const openEditVideoModal = (video) => {
    setCurrentVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      videoLink: video.videoLink || '',
      notesLink: video.notesLink || '',
      courseId: video.course?.id || ''
    });
    setIsModalOpen(true);
  };

  // Close the modal and clear URL params
  const closeModal = () => {
    setIsModalOpen(false);
    setSubmitError(''); // Clear any errors
    
    // Remove edit parameter from URL if it exists
    if (location.search.includes('edit=')) {
      navigate('/instructor/videos');
    }
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        await videoService.deleteVideo(videoId);
        setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
        setSuccessMessage('Video deleted successfully');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        setError('Failed to delete the video. Please try again.');
      }
    }
  };

  // Submit the form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitError('');

    try {
      // Validate required fields
      if (!formData.title || !formData.videoLink || !formData.courseId) {
        throw new Error('Please fill all required fields: title, video link, and course');
      }

      const videoPayload = {
        title: formData.title,
        description: formData.description,
        videoLink: formData.videoLink,
        notesLink: formData.notesLink,
        courseId: parseInt(formData.courseId)
      };

      let result;
      if (currentVideo) {
        // Update existing video
        result = await videoService.updateVideo(currentVideo.id, videoPayload);
        setSuccessMessage('Video updated successfully');
      } else {
        // Create new video
        result = await videoService.createVideo(videoPayload);
        setSuccessMessage('New video created successfully');
      }
      
      // Reset form and show success message
      fetchData();
      setIsModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Get course name by ID
  const getCourseNameById = (courseId) => {
    const course = instructorCourses.find(c => c.id === parseInt(courseId));
    return course ? course.title : 'Unknown Course';
  };

  // Check if URL is for YouTube
  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Handle course filter change
  const handleCourseFilterChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Render embedded video preview
  const renderVideoPreview = (videoLink) => {
    if (!videoLink) return null;
    
    if (isYouTubeUrl(videoLink)) {
      const videoId = getYouTubeVideoId(videoLink);
      return (
        <div className="ratio ratio-16x9 mt-2">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`} 
            title="YouTube video" 
            allowFullScreen
          ></iframe>
        </div>
      );
    } else {
      return (
        <div className="alert alert-info mt-2">
          <i className="bi bi-info-circle me-2"></i>
          Video preview is only available for YouTube links.
        </div>
      );
    }
  };

  // Fallback function to use if backend endpoint isn't ready
  const fetchInstructorVideosWithFallback = async (instructorId) => {
    try {
      // First attempt to use the proper endpoint
      const response = await videoService.getVideosByInstructorId(instructorId);
      return response.data || [];
    } catch (err) {
      console.warn('Instructor videos endpoint not available, using fallback method');
      
      // Fallback to using courses -> videos approach
      try {
        // Use the dedicated method to get instructor courses
        const coursesResponse = await courseService.getCoursesByInstructor(instructorId);
        const instructorCourses = coursesResponse.data;
        
        // Map instructor courses to their videos
        const videosPromises = instructorCourses.map(course => 
          videoService.getVideosByCourseId(course.id)
        );
        
        const videosResponses = await Promise.all(videosPromises);
        return videosResponses.flatMap(response => response.data || []);
      } catch (fallbackErr) {
        console.error('Fallback method also failed:', fallbackErr);
        throw fallbackErr;
      }
    }
  };

  return (
    <div className="container-fluid px-4 py-5">
      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Course Video Management</h1>
        <button 
          className="btn btn-primary" 
          onClick={openAddVideoModal}
          disabled={instructorCourses.length === 0}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Video
        </button>
      </div>

      {/* Success alert */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {instructorCourses.length === 0 && !loading ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-film fs-1 text-muted mb-3"></i>
            <h3>No Courses Available</h3>
            <p className="text-muted mb-4">You don't have any courses assigned yet as an instructor.</p>
            <p>Once an admin assigns courses to you, you'll be able to upload videos here.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Search and filter bar */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search videos by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <select 
                    className="form-select" 
                    value={selectedCourse}
                    onChange={handleCourseFilterChange}
                  >
                    <option value="all">All Courses</option>
                    {instructorCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
  
          {/* Videos list */}
          <div className="card shadow-sm">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Course Videos</h5>
              <span className="badge bg-primary rounded-pill">{filteredVideos.length} videos</span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-camera-video fs-1 text-muted mb-3"></i>
                  <h4>No videos found</h4>
                  <p className="text-muted">
                    {searchTerm || selectedCourse !== 'all' ? 
                      'Try adjusting your search or filter' : 
                      'Start by adding your first video'}
                  </p>
                  {!searchTerm && selectedCourse === 'all' && (
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={openAddVideoModal}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add New Video
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Video</th>
                        <th scope="col">Course</th>
                        <th scope="col">Date Added</th>
                        <th scope="col" className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVideos.map(video => (
                        <tr key={video.id}>
                          <td style={{ maxWidth: '300px' }}>
                            <div className="d-flex align-items-center">
                              {isYouTubeUrl(video.videoLink) ? (
                                <div className="bg-light rounded me-3 overflow-hidden" style={{ width: '60px', height: '45px' }}>
                                  <img 
                                    src={`https://img.youtube.com/vi/${getYouTubeVideoId(video.videoLink)}/default.jpg`}
                                    alt="Thumbnail"
                                    className="img-fluid"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = '<i class="bi bi-film fs-3 text-muted"></i>';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="bg-light rounded d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '45px' }}>
                                  <i className="bi bi-film fs-3 text-muted"></i>
                                </div>
                              )}
                              <div className="text-truncate">
                                <p className="mb-0 fw-medium">{video.title}</p>
                                <small className="text-muted text-truncate d-block">{video.description || 'No description'}</small>
                              </div>
                            </div>
                          </td>
                          <td>{video.course?.title || getCourseNameById(video.courseId)}</td>
                          <td>{formatDate(video.createdAt || video.updatedAt)}</td>
                          <td className="text-end">
                            <div className="btn-group">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditVideoModal(video)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <a 
                                href={video.videoLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-success"
                              >
                                <i className="bi bi-play-fill"></i>
                              </a>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteVideo(video.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Video Modal */}
      {isModalOpen && (
        <>
          <div className="modal fade show" style={{ 
            display: 'block', 
            zIndex: 1050,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'auto'
          }} tabIndex="-1" aria-modal="true" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {currentVideo ? 'Edit Video' : 'Add New Video'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {submitError && (
                    <div className="alert alert-danger">
                      {submitError}
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="courseId" className="form-label">Course <span className="text-danger">*</span></label>
                      <select
                        id="courseId"
                        name="courseId"
                        className="form-select"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a course</option>
                        {instructorCourses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Video Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter video title"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter video description"
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="videoLink" className="form-label">Video Link <span className="text-danger">*</span></label>
                      <input
                        type="url"
                        className="form-control"
                        id="videoLink"
                        name="videoLink"
                        value={formData.videoLink}
                        onChange={handleInputChange}
                        placeholder="Enter YouTube or other video link"
                        required
                      />
                      <small className="text-muted">
                        Supports YouTube links, Google Drive links, or other video hosting platforms
                      </small>
                      {formData.videoLink && renderVideoPreview(formData.videoLink)}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="notesLink" className="form-label">Notes/Resources Link</label>
                      <input
                        type="url"
                        className="form-control"
                        id="notesLink"
                        name="notesLink"
                        value={formData.notesLink}
                        onChange={handleInputChange}
                        placeholder="Enter link to notes or resources (optional)"
                      />
                      <small className="text-muted">
                        Optional: Link to slides, PDFs, or additional resources
                      </small>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>Save Video</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={closeModal}></div>
        </>
      )}
    </div>
  );
};

export default InstructorVideoManagement; 
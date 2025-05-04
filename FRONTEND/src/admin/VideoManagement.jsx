import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { videoService, courseService } from '../services/api';
import ImageWithFallback from '../components/common/ImageWithFallback';

const VideoManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
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
  const [submitError, setSubmitError] = useState('');

  // Add/remove modal-open class to body
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('modal-open');
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
      // Fetch both videos and courses
      const [videosResponse, coursesResponse] = await Promise.all([
        videoService.getAllVideos(),
        courseService.getAllCourses()
      ]);
      
      // Store data
      setVideos(videosResponse.data || []);
      setCourses(coursesResponse.data || []);
    } catch (err) {
      setError('Failed to load video data. Please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Filter videos based on search term
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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
      courseId: courses.length > 0 ? courses[0].id : ''
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

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videoService.deleteVideo(videoId);
        setVideos(videos.filter(video => video.id !== videoId));
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
        throw new Error('Please fill all required fields');
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
      } else {
        // Create new video
        result = await videoService.createVideo(videoPayload);
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
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };

  // Find course name by ID
  const getCourseNameById = (courseId) => {
    const course = courses.find(c => c.id === courseId);
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

  return (
    <div className="container-fluid px-4 py-5">
      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Video Management</h1>
        <button 
          className="btn btn-primary" 
          onClick={openAddVideoModal}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Video
        </button>
      </div>

      {/* Success alert */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Video has been saved successfully.
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

      {/* Search and filter bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos table */}
      <div className="card mb-4">
        <div className="card-header">
          <i className="bi bi-table me-2"></i>
          Videos
        </div>
        <div className="card-body">
          {loading && videos.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-film display-4 text-muted"></i>
              <p className="mt-3">No videos found.</p>
              <button className="btn btn-primary mt-2" onClick={openAddVideoModal}>Add your first video</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Preview</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map(video => (
                    <tr key={video.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <p className="fw-bold mb-1">{video.title}</p>
                            <p className="text-muted small mb-0">{video.description?.substring(0, 60)}{video.description?.length > 60 ? '...' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getCourseNameById(video.course?.id)}
                      </td>
                      <td>
                        {video.videoLink ? (
                          isYouTubeUrl(video.videoLink) ? (
                            <img 
                              src={`https://img.youtube.com/vi/${getYouTubeVideoId(video.videoLink)}/mqdefault.jpg`} 
                              alt="Video thumbnail" 
                              className="rounded" 
                              style={{ width: '80px', height: '45px', objectFit: 'cover' }}
                            />
                          ) : (
                            <i className="bi bi-film text-primary fs-4"></i>
                          )
                        ) : (
                          <span className="text-muted">No video</span>
                        )}
                      </td>
                      <td>
                        {formatDate(video.createdAt)}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            onClick={() => openEditVideoModal(video)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
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

      {/* Add/Edit Video Modal */}
      {isModalOpen && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={closeModal} 
            style={{ display: 'block' }}
          ></div>
          <div 
            className="modal fade show" 
            tabIndex="-1" 
            style={{ display: 'block', background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
            onClick={(e) => {
              // Close modal when clicking outside (on the background)
              if (e.target.classList.contains('modal')) {
                closeModal();
              }
            }}
          >
            <div className="modal-dialog modal-lg" style={{ zIndex: 1051 }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{currentVideo ? 'Edit Video' : 'Add New Video'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  {submitError && (
                    <div className="alert alert-danger">{submitError}</div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="videoLink" className="form-label">Video URL <span className="text-danger">*</span></label>
                      <input
                        type="url"
                        className="form-control"
                        id="videoLink"
                        name="videoLink"
                        value={formData.videoLink}
                        onChange={handleInputChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                      />
                      <div className="form-text">Enter a YouTube URL or direct video link.</div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="notesLink" className="form-label">Notes/PDF URL</label>
                      <input
                        type="url"
                        className="form-control"
                        id="notesLink"
                        name="notesLink"
                        value={formData.notesLink}
                        onChange={handleInputChange}
                        placeholder="https://example.com/notes.pdf"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="courseId" className="form-label">Course <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="courseId"
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
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
        </>
      )}
    </div>
  );
};

export default VideoManagement; 
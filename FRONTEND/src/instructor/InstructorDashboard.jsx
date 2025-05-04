import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService, videoService } from '../services/api';
import axios from 'axios';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalVideos: 0,
    recentUploads: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const instructorId = localStorage.getItem('userId');
      
      // Fetch courses using the dedicated method
      const coursesResponse = await courseService.getCoursesByInstructor(instructorId);
      const instructorCourses = coursesResponse.data;
      
      // Fetch videos using fallback function
      const allVideos = await fetchInstructorVideosWithFallback(instructorId);
      
      // Get recent uploads (last 5)
      const sortedVideos = [...allVideos].sort((a, b) => 
        new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0)
      );
      
      setStats({
        totalCourses: instructorCourses.length,
        totalVideos: allVideos.length,
        recentUploads: sortedVideos.slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <h1 className="h3 mb-4">Instructor Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <motion.div 
            className="card h-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-book fs-1 text-primary"></i>
              </div>
              <div>
                <h5 className="card-title">My Courses</h5>
                <h2 className="mb-0">{stats.totalCourses}</h2>
                <p className="text-muted small mb-0">Total courses created</p>
              </div>
            </div>
            <div className="card-footer bg-transparent border-top-0">
              <Link to="/instructor/courses" className="btn btn-sm btn-outline-primary">
                Manage Courses
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="col-md-6">
          <motion.div 
            className="card h-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-film fs-1 text-success"></i>
              </div>
              <div>
                <h5 className="card-title">Course Videos</h5>
                <h2 className="mb-0">{stats.totalVideos}</h2>
                <p className="text-muted small mb-0">Total videos uploaded</p>
              </div>
            </div>
            <div className="card-footer bg-transparent border-top-0">
              <Link to="/instructor/videos" className="btn btn-sm btn-outline-success">
                Manage Videos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-transparent">
          <h5 className="mb-0">Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <Link to="/instructor/videos" className="btn btn-primary w-100">
                <i className="bi bi-cloud-upload me-2"></i>
                Upload New Video
              </Link>
            </div>
            <div className="col-md-6">
              <Link to="/instructor/courses" className="btn btn-outline-primary w-100">
                <i className="bi bi-eye me-2"></i>
                View My Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Uploads */}
      <motion.div 
        className="card shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Video Uploads</h5>
          <Link to="/instructor/videos" className="btn btn-sm btn-link">View All</Link>
        </div>
        <div className="card-body p-0">
          {stats.recentUploads.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Video Title</th>
                    <th scope="col">Course</th>
                    <th scope="col">Uploaded</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUploads.map(video => (
                    <tr key={video.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded me-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <i className="bi bi-film text-muted"></i>
                          </div>
                          <div>
                            {video.title}
                          </div>
                        </div>
                      </td>
                      <td>{video.course?.title || 'Unknown Course'}</td>
                      <td>{formatDate(video.createdAt || video.updatedAt)}</td>
                      <td className="text-end">
                        <Link to={`/instructor/videos?edit=${video.id}`} className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <a href={video.videoLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="mb-3 text-muted">No videos uploaded yet</p>
              <Link to="/instructor/videos" className="btn btn-primary">
                <i className="bi bi-cloud-upload me-2"></i>
                Upload Your First Video
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InstructorDashboard; 
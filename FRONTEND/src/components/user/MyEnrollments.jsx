import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { enrollmentService, courseService, handleApiError } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      fetchData(false); // Don't show loading indicator for poll updates
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Get current user ID
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      // Fetch all courses
      const coursesResponse = await courseService.getCourses();
      setCourses(coursesResponse.data || []);
      
      // Fetch enrollments using the getAllEnrollments method
      const enrollmentsResponse = await enrollmentService.getAllEnrollments();
      
      // Filter for current user's enrollments
      const userEnrollments = enrollmentsResponse.data.filter(
        enrollment => {
          // Check different ways the userId might be stored
          const enrollmentUserId = enrollment.userId || 
                                  (enrollment.user && enrollment.user.id) || 
                                  null;
          
          return enrollmentUserId && enrollmentUserId.toString() === userId.toString();
        }
      );
      
      setEnrollments(userEnrollments);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  // Filter enrollments based on filter and search term
  const filteredEnrollments = enrollments.filter(enrollment => {
    // Get course details
    const course = courses.find(
      c => c.id === enrollment.courseId || c.id === enrollment.course?.id
    );
    
    if (!course) return false;
    
    // Apply status filter
    const matchesFilter = filter === 'all' || enrollment.status === filter;
    
    // Apply search
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Group enrollments by status
  const enrollmentsByStatus = {
    ENROLLED: enrollments.filter(e => e.status === 'ENROLLED').length,
    IN_PROGRESS: enrollments.filter(e => e.status === 'IN_PROGRESS').length,
    COMPLETED: enrollments.filter(e => e.status === 'COMPLETED').length,
    CANCELLED: enrollments.filter(e => e.status === 'CANCELLED' || e.status === 'DROPPED').length,
  };

  // Get course details by ID
  const getCourse = (courseId) => {
    if (!courseId) return {};
    
    // Find the course in our courses array
    const course = courses.find(c => 
      // Compare as strings to handle different data types (number vs string)
      c.id?.toString() === courseId?.toString() || 
      c.id?.toString() === courseId?.toString()
    );
    
    return course || {};
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-primary';
      case 'IN_PROGRESS':
        return 'bg-info';
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
      case 'DROPPED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (enrollment) => {
    if (enrollment.progress !== undefined && enrollment.progress !== null) {
      // Use the actual progress value from the enrollment if it exists
      return enrollment.progress;
    }
    
    // Fallback cases based on status
    switch (enrollment.status) {
      case 'ENROLLED':
        return 0;
      case 'IN_PROGRESS':
        return 50; // Default to 50% if no progress data
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  };

  // Function to handle continuing a course
  const handleContinueLearning = (enrollment, course) => {
    if (enrollment.status === 'COMPLETED') {
      // Navigate to certificate page for completed courses
      navigate(`/certificate/${course.id}`, {
        state: {
          course: {
            id: course.id,
            courseName: course.title || course.courseName,
            instructor: course.instructor?.name || 'Expert Instructor',
          },
          userName: localStorage.getItem('name')
        }
      });
    } else {
      // Navigate to course player for ongoing courses
      navigate(`/course-player/${course.id}`, {
        state: {
          course: {
            id: course.id,
            img: course.thumbnail || course.imageUrl || "https://via.placeholder.com/800x600?text=Course+Image",
            logo: "https://pamutalwar.s3.eu-north-1.amazonaws.com/courses/logo.jpg",
            instit: course.instructor?.name || 'Expert Instructor',
            courseName: course.title || course.courseName,
            degree: "Earn a certificate",
            Price: course.price || 0,
            Pamu: course.description || "No description available"
          }
        }
      });
    }
  };

  if (loading && enrollments.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your enrollments...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">My Enrollments</h2>
          <p className="text-muted">Track your course progress</p>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group">
            <span className="input-group-text bg-light border-0">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control bg-light border-0" 
              placeholder="Search enrollments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-outline-primary" 
            onClick={handleRefresh}
            title="Refresh enrollments"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
      
      {/* Enrollment Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <motion.div 
            className="card border-0 shadow-sm h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <i className="bi bi-journal-check fs-4 text-primary"></i>
              </div>
              <div>
                <h6 className="fw-normal text-muted mb-0">Total Enrollments</h6>
                <h4 className="fw-bold mb-0">{enrollments.length}</h4>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div 
            className="card border-0 shadow-sm h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <i className="bi bi-play-circle-fill fs-4 text-info"></i>
              </div>
              <div>
                <h6 className="fw-normal text-muted mb-0">In Progress</h6>
                <h4 className="fw-bold mb-0">{enrollmentsByStatus.IN_PROGRESS}</h4>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div 
            className="card border-0 shadow-sm h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <i className="bi bi-trophy-fill fs-4 text-success"></i>
              </div>
              <div>
                <h6 className="fw-normal text-muted mb-0">Completed</h6>
                <h4 className="fw-bold mb-0">{enrollmentsByStatus.COMPLETED}</h4>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div 
            className="card border-0 shadow-sm h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-body d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                <i className="bi bi-lightning-charge-fill fs-4 text-warning"></i>
              </div>
              <div>
                <h6 className="fw-normal text-muted mb-0">Active Courses</h6>
                <h4 className="fw-bold mb-0">{enrollmentsByStatus.ENROLLED + enrollmentsByStatus.IN_PROGRESS}</h4>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            type="button" 
            className={`btn ${filter === 'ENROLLED' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('ENROLLED')}
          >
            Enrolled
          </button>
          <button 
            type="button" 
            className={`btn ${filter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('IN_PROGRESS')}
          >
            In Progress
          </button>
          <button 
            type="button" 
            className={`btn ${filter === 'COMPLETED' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed
          </button>
        </div>
      </div>
      
      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-x display-1 text-muted"></i>
          <h3 className="mt-3">No enrollments found</h3>
          <p className="text-muted">
            {enrollments.length === 0 
              ? "You haven't enrolled in any courses yet" 
              : "Try adjusting your search or filter"}
          </p>
          {enrollments.length === 0 && (
            <a href="/courses" className="btn btn-primary mt-2">Browse Courses</a>
          )}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {filteredEnrollments.map((enrollment) => {
            const course = getCourse(enrollment.courseId || enrollment.course?.id);
            
            return (
              <motion.div 
                key={enrollment.id}
                className="col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card h-100 shadow-sm border-0">
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img 
                        src={course.thumbnail || course.imageUrl || "https://via.placeholder.com/300x200?text=Course+Image"} 
                        className="img-fluid rounded-start h-100"
                        alt={course.title || course.courseName || 'Course'}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=Course+Image";
                        }}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="card-body d-flex flex-column h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{course.title || course.courseName || 'Untitled Course'}</h5>
                          <span className={`badge ${getStatusBadgeClass(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </div>
                        
                        <p className="card-text text-muted small">
                          <i className="bi bi-calendar-date me-1"></i>
                          Enrolled: {formatDate(enrollment.enrollmentDate)}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small text-muted">Progress</span>
                            <span className="small fw-bold">{getProgressPercentage(enrollment)}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${getProgressPercentage(enrollment)}%` }}
                              aria-valuenow={getProgressPercentage(enrollment)}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          
                          <div className="d-grid mt-3">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleContinueLearning(enrollment, course)}
                            >
                              {enrollment.status === 'COMPLETED' 
                                ? 'View Certificate' 
                                : 'Continue Learning'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments; 
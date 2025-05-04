import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { courseService, enrollmentService, handleApiError } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const EnrollCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    
    // Set up polling for real-time updates every minute
    const intervalId = setInterval(() => {
      fetchCourses(false); // Don't show loading indicator for poll updates
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchCourses = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await courseService.getCourses();
      
      // Filter only published courses
      const publishedCourses = response.data.filter(course => 
        course.status === 'PUBLISHED' || course.status === 'Published'
      );
      setCourses(publishedCourses);
      
      // Check enrollment status for each course
      const userId = localStorage.getItem('userId');
      if (userId) {
        checkEnrollmentStatus(publishedCourses, userId);
      }
    } catch (err) {
      setError(handleApiError(err) || 'Failed to load courses. Please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const checkEnrollmentStatus = async (courses, userId) => {
    try {
      const enrollmentsResponse = await enrollmentService.getAllEnrollments();
      const userEnrollments = enrollmentsResponse.data.filter(
        enrollment => {
          const enrollmentUserId = enrollment.userId || 
                                  (enrollment.user && enrollment.user.id) || 
                                  null;
          
          return enrollmentUserId && enrollmentUserId.toString() === userId.toString();
        }
      );
      
      // Create a map of courseId to enrollment status
      const statusMap = {};
      userEnrollments.forEach(enrollment => {
        const courseId = enrollment.courseId || (enrollment.course && enrollment.course.id);
        if (courseId) {
          statusMap[courseId] = enrollment.status;
        }
      });
      
      setEnrollmentStatus(statusMap);
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourse(courseId);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('You must be logged in to enroll in a course');
        return;
      }
      
      // Create enrollment
      await enrollmentService.createEnrollment({
        userId,
        courseId,
        status: 'ENROLLED',
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
      
      // Update status
      setEnrollmentStatus(prev => ({
        ...prev,
        [courseId]: 'ENROLLED'
      }));
      
      // Show success message
      alert('Successfully enrolled in the course!');
    } catch (err) {
      setError(handleApiError(err) || 'Failed to enroll in the course. Please try again later.');
    } finally {
      setEnrollingCourse(null);
    }
  };

  const handleRefresh = () => {
    fetchCourses(true);
  };

  const handleCourseClick = (course) => {
    navigate(`/coursedetail`, { 
      state: { 
        course: {
          id: course.id,
          img: course.thumbnail || "https://via.placeholder.com/300x200?text=Course+Image",
          logo: "https://pamutalwar.s3.eu-north-1.amazonaws.com/courses/logo.jpg",
          instit: course.instructor?.name || 'Expert Instructor',
          courseName: course.title,
          degree: "Earn a certificate",
          Price: course.price || 0,
          Pamu: course.description || "No description available"
        } 
      }
    });
  };

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.instructor && course.instructor.name && 
     course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEnrollButtonText = (courseId) => {
    const status = enrollmentStatus[courseId];
    if (!status) return 'Enroll Now';
    
    switch (status) {
      case 'ENROLLED':
        return 'Enrolled';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
      case 'DROPPED':
        return 'Enroll Again';
      default:
        return 'Enroll Now';
    }
  };

  const isEnrollButtonDisabled = (courseId) => {
    const status = enrollmentStatus[courseId];
    return status === 'ENROLLED' || status === 'IN_PROGRESS' || status === 'COMPLETED';
  };

  if (loading && courses.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Available Courses</h2>
          <p className="text-muted">Explore and enroll in our courses</p>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group">
            <span className="input-group-text bg-light border-0">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control bg-light border-0" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-outline-primary" 
            onClick={handleRefresh}
            title="Refresh courses"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-x display-1 text-muted"></i>
          <h3 className="mt-3">No courses found</h3>
          <p className="text-muted">Try adjusting your search or check back later for new courses</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredCourses.map((course) => (
            <motion.div 
              key={course.id}
              className="col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card h-100 shadow-sm border-0">
                <div 
                  className="position-relative cursor-pointer"
                  onClick={() => handleCourseClick(course)}
                >
                  <img 
                    src={course.thumbnail || "https://via.placeholder.com/300x200?text=Course+Image"} 
                    className="card-img-top" 
                    alt={course.title}
                    style={{ height: '180px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=Course+Image";
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 p-2">
                    <span className="badge bg-primary">{course.category?.name || 'General'}</span>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text text-muted small">
                    {course.description?.length > 100 
                      ? course.description.substring(0, 100) + '...' 
                      : course.description || 'No description available'}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">
                      <i className="bi bi-clock me-1"></i> 
                      {course.duration || '8 weeks'}
                    </span>
                    <span className="text-muted small">
                      <i className="bi bi-star-fill me-1 text-warning"></i>
                      {course.rating || '4.5'}/5
                    </span>
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" style={{ width: '30px', height: '30px' }}>
                      <i className="bi bi-person"></i>
                    </div>
                    <span className="small">{course.instructor?.name || 'Expert Instructor'}</span>
                  </div>
                  <button 
                    className={`btn ${isEnrollButtonDisabled(course.id) ? 'btn-success' : 'btn-primary'} btn-sm`}
                    onClick={() => handleEnroll(course.id)}
                    disabled={isEnrollButtonDisabled(course.id) || enrollingCourse === course.id}
                  >
                    {enrollingCourse === course.id ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enrolling...
                      </>
                    ) : (
                      getEnrollButtonText(course.id)
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrollCourses; 
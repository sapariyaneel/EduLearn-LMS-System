import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { enrollmentService, courseService, userService, handleApiError } from '../services/api';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    courseId: '',
    status: 'ENROLLED',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

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

  // Stats for the overview cards
  const stats = [
    { 
      title: 'Total Enrollments', 
      value: enrollments.length, 
      icon: 'bi-journal-check', 
      color: 'primary' 
    },
    { 
      title: 'Active', 
      value: enrollments.filter(e => e.status === 'ENROLLED' || e.status === 'IN_PROGRESS').length, 
      icon: 'bi-play-circle-fill', 
      color: 'success' 
    },
    { 
      title: 'Completed', 
      value: enrollments.filter(e => e.status === 'COMPLETED').length, 
      icon: 'bi-trophy-fill', 
      color: 'warning' 
    },
    { 
      title: 'Cancelled', 
      value: enrollments.filter(e => e.status === 'CANCELLED' || e.status === 'DROPPED').length, 
      icon: 'bi-x-circle-fill', 
      color: 'danger' 
    },
  ];

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
      // Fetch enrollments
      const enrollmentResponse = await enrollmentService.getEnrollments();
      setEnrollments(enrollmentResponse.data || []);

      // Fetch courses for dropdown
      const coursesResponse = await courseService.getCourses();
      setCourses(coursesResponse.data || []);

      // Fetch users for dropdown
      const usersResponse = await userService.getUsers();
      setUsers(usersResponse.data || []);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Filter enrollments based on current filter and search term
  const filteredEnrollments = enrollments.filter(enrollment => {
    // Get associated course and user names
    const course = courses.find(c => c.id === enrollment.courseId || c.id === enrollment.course?.id);
    const user = users.find(u => u.id === enrollment.userId || u.id === enrollment.user?.id);
    
    const courseName = course?.title || 'Unknown Course';
    const userName = user?.name || 'Unknown User';
    
    // Filter by status
    const matchesFilter = filter === 'all' || 
                         enrollment.status === filter;
    
    // Filter by search term in course name or user name
    const matchesSearch = courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (enrollment.enrollmentId && enrollment.enrollmentId.toString().includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal to add enrollment
  const openAddEnrollmentModal = () => {
    setCurrentEnrollment(null);
    setFormData({
      userId: users.length > 0 ? users[0].id : '',
      courseId: courses.length > 0 ? courses[0].id : '',
      status: 'ENROLLED',
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  // Open modal to edit enrollment
  const openEditEnrollmentModal = (enrollment) => {
    setCurrentEnrollment(enrollment);
    setFormData({
      userId: enrollment.userId || enrollment.user?.id || '',
      courseId: enrollment.courseId || enrollment.course?.id || '',
      status: enrollment.status || 'ENROLLED',
      enrollmentDate: enrollment.enrollmentDate || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Submit form (create or update enrollment)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (currentEnrollment) {
        // Update enrollment
        await enrollmentService.updateEnrollment(currentEnrollment.id, formData);
      } else {
        // Create enrollment
        await enrollmentService.createEnrollment(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle enrollment deletion
  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }
    
    try {
      await enrollmentService.deleteEnrollment(enrollmentId);
      fetchData();
    } catch (err) {
      setError(handleApiError(err));
    }
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

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId || u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Get course title by ID
  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId || c.id === courseId);
    return course ? course.title : 'Unknown Course';
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

  if (loading && enrollments.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-management">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {stats.map((stat, index) => (
          <div className="col-md-6 col-xl-3" key={index}>
            <motion.div 
              className={`card border-0 shadow-sm h-100`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-body d-flex align-items-center">
                <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded me-3`}>
                  <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                </div>
                <div>
                  <h6 className="fw-normal text-muted mb-0">{stat.title}</h6>
                  <h4 className="fw-bold mb-0">{stat.value}</h4>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div 
        className="card border-0 shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8 mb-3 mb-md-0">
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All Enrollments
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
                <button 
                  type="button" 
                  className={`btn ${filter === 'CANCELLED' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('CANCELLED')}
                >
                  Cancelled
                </button>
              </div>
            </div>
            <div className="col-md-4">
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
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enrollments List */}
      <motion.div 
        className="card border-0 shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Enrollments</h5>
          <button 
            className="btn btn-primary" 
            onClick={openAddEnrollmentModal}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Enrollment
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Student</th>
                  <th scope="col">Course</th>
                  <th scope="col">Enrollment Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No enrollments found.
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>#{enrollment.id}</td>
                      <td>{getUserName(enrollment.userId || enrollment.user?.id)}</td>
                      <td>{getCourseTitle(enrollment.courseId || enrollment.course?.id)}</td>
                      <td>{formatDate(enrollment.enrollmentDate)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-outline-primary" 
                            onClick={() => openEditEnrollmentModal(enrollment)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger" 
                            onClick={() => handleDeleteEnrollment(enrollment.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Enrollment Form Modal */}
      {isModalOpen && (
        <>
          <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {currentEnrollment ? 'Edit Enrollment' : 'Add New Enrollment'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="userId" className="form-label">Student</label>
                      <select 
                        id="userId" 
                        name="userId" 
                        className="form-select"
                        value={formData.userId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Student</option>
                        {users
                          .filter(user => user.role === 'STUDENT')
                          .map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="courseId" className="form-label">Course</label>
                      <select 
                        id="courseId" 
                        name="courseId" 
                        className="form-select"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select 
                        id="status" 
                        name="status" 
                        className="form-select"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="ENROLLED">Enrolled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="DROPPED">Dropped</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="enrollmentDate" className="form-label">Enrollment Date</label>
                      <input 
                        type="date" 
                        id="enrollmentDate" 
                        name="enrollmentDate" 
                        className="form-control"
                        value={formData.enrollmentDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="button" className="btn btn-outline-secondary me-2" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          'Save Enrollment'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={closeModal} style={{ zIndex: 1040 }}></div>
        </>
      )}
    </div>
  );
};

export default Enrollments; 
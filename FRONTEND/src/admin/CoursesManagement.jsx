import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { courseService, categoryService } from '../services/api';
import ImageWithFallback from '../components/common/ImageWithFallback';

const CoursesManagement = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    instructorId: 1, // Default to current user ID in real app
    price: 0,
    status: 'DRAFT'
  });
  const [thumbnail, setThumbnail] = useState(null);
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
      // Fetch both courses and categories
      const [coursesResponse, categoriesResponse] = await Promise.all([
        courseService.getAllCourses(),
        categoryService.getAllCategories()
      ]);
      
      // Store categories
      const categoriesData = categoriesResponse.data || [];
      setCategories(categoriesData);
      
      // Get the courses
      const coursesData = coursesResponse.data || [];
      
      // Create a map of categoryId to category for quick lookups
      const categoryMap = {};
      categoriesData.forEach(category => {
        categoryMap[category.id] = category;
      });
      
      // Enhance each course with its category
      const enhancedCourses = coursesData.map(course => {
        // If the course already has a category object, use it
        if (!course.category && course.categoryId) {
          // Add the category object to the course
          course.category = categoryMap[course.categoryId];
        }
        return course;
      });
      
      // Set the enhanced courses
      setCourses(enhancedCourses);
    } catch (err) {
      setError('Failed to load course data. Please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Filter courses based on current filter and search term
  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && course.status === 'DRAFT') ||
                         (filter === 'approved' && course.status === 'PUBLISHED') ||
                         (filter === 'rejected' && course.status === 'ARCHIVED');
    
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Stats for the overview cards
  const stats = [
    { title: 'Total Courses', value: courses.length, icon: 'bi-book-fill', color: 'primary' },
    { title: 'Pending Approval', value: courses.filter(c => c.status === 'DRAFT').length, icon: 'bi-hourglass-split', color: 'warning' },
    { title: 'Published', value: courses.filter(c => c.status === 'PUBLISHED').length, icon: 'bi-check-circle-fill', color: 'success' },
    { title: 'Archived', value: courses.filter(c => c.status === 'ARCHIVED').length, icon: 'bi-x-circle-fill', color: 'danger' },
  ];

  // Handle input change in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input change for thumbnail
  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  // Open modal for creating a new course
  const openAddCourseModal = () => {
    setCurrentCourse(null);
    setFormData({
      title: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      instructorId: 1, // Default to current user ID in real app
      price: 0,
      status: 'DRAFT'
    });
    setThumbnail(null);
    setIsModalOpen(true);
  };

  // Open modal for editing a course
  const openEditCourseModal = (course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      categoryId: course.categoryId || '',
      instructorId: course.instructor?.id || 1,
      price: course.price || 0,
      status: course.status || 'DRAFT'
    });
    setThumbnail(null);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Submit the form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitError('');

    try {
      // Create FormData object for API call
      const courseFormData = new FormData();

      // Prepare course object with proper structure
      const courseObj = {
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId), // Ensure categoryId is a number
        price: parseFloat(formData.price), // Ensure price is a number
        status: formData.status,
        instructor: { id: parseInt(formData.instructorId) } // Ensure instructorId is a number
      };

      // Convert courseObj to a JSON string and append as 'course'
      courseFormData.append('course', new Blob([JSON.stringify(courseObj)], {
        type: 'application/json'
      }));

      // If thumbnail is provided, append it
      if (thumbnail) {
        courseFormData.append('thumbnail', thumbnail);
      }

      // Set the correct content type for the request (let browser set it for multipart)
      const config = {
        headers: {
          'Content-Type': undefined
        }
      };

      if (currentCourse) {
        // Update existing course
        await courseService.updateCourse(currentCourse.id, courseFormData, config);
      } else {
        // Create new course
        await courseService.createCourse(courseFormData, config);
      }
      
      // Reset form and show success message
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        instructorId: 1,
        price: 0,
        status: 'DRAFT'
      });
      setThumbnail(null);
      setIsModalOpen(false);
      setShowSuccess(true);
      fetchData();
    } catch (err) {
      // Handle error gracefully without debugging logs
      setSubmitError('Failed to submit course. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle course approval/rejection
  const handleStatusChange = async (courseId, newStatus) => {
    try {
      // Proceed with the status change
      await courseService.updateCourseStatus(courseId, newStatus);
      
      // Refresh the courses list
      fetchData();
    } catch (err) {
      setError('Failed to update course status. Please try again later.');
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

  if (loading && courses.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-management">
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
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All Courses
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('approved')}
                >
                  Approved
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('rejected')}
                >
                  Rejected
                </button>
              </div>
            </div>
            <div className="col-md-6">
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
            </div>
          </div>
        </div>
      </motion.div>

      {/* Courses List */}
      <motion.div 
        className="card border-0 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Course Management</h5>
          <button className="btn btn-primary btn-sm" onClick={openAddCourseModal}>
            <i className="bi bi-plus-lg me-1"></i> Add New Course
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th scope="col" style={{ minWidth: '250px' }}>Course</th>
                <th scope="col">Category</th>
                <th scope="col">Instructor</th>
                <th scope="col">Submitted</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <ImageWithFallback 
                          src={course.thumbnailUrl || 'https://placehold.co/50'}
                          alt={course.title} 
                          className="rounded me-3" 
                          width="50" 
                          height="50"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <h6 className="mb-0">{course.title}</h6>
                          {course.status === 'PUBLISHED' && (
                            <div className="d-flex align-items-center small text-muted">
                              <span className="me-2">
                                <i className="bi bi-star-fill text-warning me-1"></i>
                                {course.rating || 'N/A'}
                              </span>
                              <span>
                                <i className="bi bi-people-fill me-1"></i>
                                {course.enrollmentCount || 0} students
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {(() => {
                        // If course has a category object with name, use it
                        if (course.category?.name) {
                          return course.category.name;
                        }

                        // Otherwise, try to find the category by ID
                        if (course.categoryId) {
                          const category = categories.find(cat => cat.id === course.categoryId);
                          return category?.name || 'Uncategorized';
                        }
                        
                        return 'Uncategorized';
                      })()}
                    </td>
                    <td>{course.instructor?.name || 'Unknown'}</td>
                    <td>{formatDate(course.createdAt)}</td>
                    <td>
                      <span className={`badge rounded-pill ${
                        course.status === 'PUBLISHED' ? 'bg-success' : 
                        course.status === 'DRAFT' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {course.status === 'PUBLISHED' ? 'Approved' : 
                         course.status === 'DRAFT' ? 'Pending' : 'Rejected'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => openEditCourseModal(course)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {course.status === 'DRAFT' && (
                          <>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleStatusChange(course.id, 'PUBLISHED')}
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleStatusChange(course.id, 'ARCHIVED')}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-search fs-1 text-muted mb-3"></i>
                      <h5 className="text-muted">No courses found</h5>
                      <p className="text-muted">Try changing your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <>
          <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{currentCourse ? 'Edit Course' : 'Add New Course'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Course Title</label>
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
                        rows="4"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="categoryId" className="form-label">Category</label>
                        <select 
                          className="form-select" 
                          id="categoryId" 
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="price" className="form-label">Price</label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input 
                            type="number" 
                            className="form-control" 
                            id="price" 
                            name="price"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="thumbnail" className="form-label">Thumbnail Image</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="thumbnail" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <small className="text-muted">
                        {currentCourse ? 'Upload a new image to replace the existing one' : 'Recommended size: 600x400px'}
                      </small>
                    </div>
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
                        'Save Course'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={closeModal}></div>
        </>
      )}

      {showSuccess && (
        <div className="alert alert-success">
          Course {currentCourse ? 'updated' : 'added'} successfully!
        </div>
      )}

      {submitError && (
        <div className="alert alert-danger">
          {submitError}
        </div>
      )}
    </div>
  );
};

export default CoursesManagement; 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userService, handleApiError, courseService } from '../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

const Users = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

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
      title: 'Total Users', 
      value: users.length, 
      icon: 'bi-people-fill', 
      color: 'primary' 
    },
    { 
      title: 'Students', 
      value: users.filter(u => u.role === 'STUDENT').length, 
      icon: 'bi-mortarboard-fill', 
      color: 'success' 
    },
    { 
      title: 'Instructors', 
      value: users.filter(u => u.role === 'INSTRUCTOR').length, 
      icon: 'bi-person-workspace', 
      color: 'warning' 
    },
    { 
      title: 'Admins', 
      value: users.filter(u => u.role === 'ADMIN').length, 
      icon: 'bi-shield-check', 
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
    if (showLoading) {
      setLoading(true);
    }
    
    // Check for token first
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }
    
    try {
      // Fetch users
      const usersResponse = await userService.getAllUsers();
      setUsers(usersResponse.data);
      // No need to set filteredUsers separately as it's derived from users in a computed property
      setError(''); // Clear any previous errors
      
      // Fetch courses in parallel
      fetchCourses().catch(err => {
        console.error('Error fetching courses:', err);
        // Don't fail the whole operation if courses can't be fetched
        toast.error('Failed to load courses, but user data was retrieved');
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(`Failed to load users: ${error.response.data?.message || error.response.statusText}`);
        }
      } else if (error.request) {
        setError('Network error. Please check if the server is running.');
      } else {
        setError('An unexpected error occurred while loading users');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Filter users based on current filter and search term
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || 
                          user.role === filter || 
                          user.status === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Open modal to add user
  const openAddUserModal = () => {
    setCurrentUser(null);
    setEditMode(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT'
    });
    setSelectedCourses([]);
    setIsModalOpen(true);
  };

  // Open modal to edit user
  const openEditUserModal = (user) => {
    setEditMode(true);
    setCurrentUser(user);
    const { id, name, email, role, status, courses: userCourses = [] } = user;
    
    // Get the course IDs assigned to this instructor
    const assignedCourseIds = userCourses?.map(course => course.id) || [];
    setSelectedCourses(assignedCourseIds);
    
    setFormData({
      id,
      name,
      email,
      password: '',
      role,
      status
    });
    
    setIsModalOpen(true);
  };

  // Submit form (create or update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let response;
      
      if (editMode) {
        // Create a complete user object with all the required fields
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status || 'ACTIVE',
          // Only include password if provided
          ...(formData.password ? { password: formData.password } : {})
        };
        
        console.log('Update payload:', updatePayload);
        
        // Step 1: Update the user first
        response = await userService.updateUser(formData.id, updatePayload);
        console.log('User update successful:', response.data);
        
        // Step 2: Handle course assignments only if user update was successful
        if (formData.role === 'INSTRUCTOR') {
          try {
            // Get the currently assigned courses from the database
            const currentUser = users.find(u => u.id === formData.id);
            const currentCourseIds = currentUser?.courses?.map(c => c.id) || [];
            
            // Find courses to add (in selectedCourses but not in currentCourseIds)
            const coursesToAdd = selectedCourses.filter(id => !currentCourseIds.includes(id));
            
            // Find courses to remove (in currentCourseIds but not in selectedCourses)
            const coursesToRemove = currentCourseIds.filter(id => !selectedCourses.includes(id));
            
            console.log('Courses to add:', coursesToAdd);
            console.log('Courses to remove:', coursesToRemove);
            
            // Process course assignments sequentially to avoid overwhelming the server
            // Assign new courses
            for (const courseId of coursesToAdd) {
              try {
                await courseService.assignCourseToInstructor(courseId, formData.id);
                console.log(`Successfully assigned course ${courseId} to instructor ${formData.id}`);
              } catch (err) {
                console.error(`Failed to assign course ${courseId}:`, err);
                toast.error(`Failed to assign course ${courseId}. Will continue with other courses.`);
                // Continue with other courses even if one fails
              }
            }
            
            // Remove courses that were unselected
            for (const courseId of coursesToRemove) {
              try {
                await courseService.assignCourseToInstructor(courseId, null);
                console.log(`Successfully unassigned course ${courseId}`);
              } catch (err) {
                console.error(`Failed to unassign course ${courseId}:`, err);
                toast.error(`Failed to unassign course ${courseId}. Will continue with other courses.`);
                // Continue with other courses even if one fails
              }
            }
            
            // Show success even if some course assignments failed
            toast.success('User updated successfully. Some course assignments may need to be reviewed.');
          } catch (courseErr) {
            console.error('Error during course assignment:', courseErr);
            toast.error('User was updated but there were issues with course assignments.');
          }
        } else {
          toast.success('User updated successfully');
        }
      } else {
        // For new users, include all required fields
        const createPayload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status || 'ACTIVE'
        };
        
        console.log('Create payload:', createPayload);
        
        response = await userService.createUser(createPayload);
        console.log('User creation successful:', response.data);
        
        // Handle course assignments for new instructors
        if (formData.role === 'INSTRUCTOR' && selectedCourses.length > 0) {
          const newUserId = response.data.id;
          
          // Assign selected courses to the new instructor sequentially
          for (const courseId of selectedCourses) {
            try {
              await courseService.assignCourseToInstructor(courseId, newUserId);
              console.log(`Successfully assigned course ${courseId} to new instructor ${newUserId}`);
            } catch (err) {
              console.error(`Failed to assign course ${courseId}:`, err);
              toast.error(`Failed to assign course ${courseId} to new instructor. Will continue with other courses.`);
              // Continue with other courses even if one fails
            }
          }
          
          toast.success('User created successfully. Some course assignments may need to be reviewed.');
        } else {
          toast.success('User created successfully');
        }
      }
      
      // Refresh user data
      fetchData();
      setIsModalOpen(false);
      setEditMode(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error submitting user:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Server error';
        toast.error(`Failed to save user: ${errorMessage}`);
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
        console.error('Network error - no response received');
      } else {
        toast.error('An unexpected error occurred');
        console.error('Error details:', error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle user status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      fetchData();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await userService.deleteUser(userId);
      fetchData();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  // Add this function to handle course selection
  const handleCourseSelection = selectedOptions => {
    // Convert the react-select values to just an array of IDs
    const courseIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedCourses(courseIds);
  };

  // Function to close modal and reset state
  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setCurrentUser(null);
    setSelectedCourses([]);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT'
    });
  };

  return (
    <div className="user-management">
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
                  All Users
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'STUDENT' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('STUDENT')}
                >
                  Students
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'INSTRUCTOR' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('INSTRUCTOR')}
                >
                  Instructors
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'ADMIN' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('ADMIN')}
                >
                  Admins
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'ACTIVE' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('ACTIVE')}
                >
                  Active
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'BLOCKED' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('BLOCKED')}
                >
                  Blocked
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
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="mb-4 d-flex justify-content-end">
        <button 
          className="btn btn-primary" 
          onClick={openAddUserModal}
        >
          <i className="bi bi-person-plus me-2"></i>
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <motion.div 
        className="card border-0 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 ps-4">User</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Join Date</th>
                  <th className="py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="py-3 ps-4">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                className="rounded-circle" 
                                width="40" 
                                height="40" 
                                alt={user.name} 
                              />
                            ) : (
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-person"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-0">{user.name}</h6>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <span className={`badge bg-${
                          user.role === 'ADMIN' ? 'danger' :
                          user.role === 'INSTRUCTOR' ? 'warning' : 'success'
                        } bg-opacity-10 text-${
                          user.role === 'ADMIN' ? 'danger' :
                          user.role === 'INSTRUCTOR' ? 'warning' : 'success'
                        } px-3 py-2`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${
                          user.status === 'ACTIVE' ? 'success' :
                          user.status === 'INACTIVE' ? 'warning' : 'danger'
                        } bg-opacity-10 text-${
                          user.status === 'ACTIVE' ? 'success' :
                          user.status === 'INACTIVE' ? 'warning' : 'danger'
                        } px-3 py-2`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-end pe-4">
                        <div className="dropdown">
                          <button className="btn btn-sm px-0" type="button" data-bs-toggle="dropdown">
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => openEditUserModal(user)}
                              >
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </button>
                            </li>
                            {user.status === 'ACTIVE' ? (
                              <li>
                                <button 
                                  className="dropdown-item text-warning" 
                                  onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                                >
                                  <i className="bi bi-pause-circle me-2"></i>
                                  Deactivate
                                </button>
                              </li>
                            ) : user.status === 'INACTIVE' ? (
                              <li>
                                <button 
                                  className="dropdown-item text-success" 
                                  onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                >
                                  <i className="bi bi-play-circle me-2"></i>
                                  Activate
                                </button>
                              </li>
                            ) : null}
                            {user.status !== 'BLOCKED' ? (
                              <li>
                                <button 
                                  className="dropdown-item text-danger" 
                                  onClick={() => handleStatusChange(user.id, 'BLOCKED')}
                                >
                                  <i className="bi bi-slash-circle me-2"></i>
                                  Block
                                </button>
                              </li>
                            ) : (
                              <li>
                                <button 
                                  className="dropdown-item text-success" 
                                  onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                >
                                  <i className="bi bi-check-circle me-2"></i>
                                  Unblock
                                </button>
                              </li>
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button 
                                className="dropdown-item text-danger" 
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </button>
                            </li>
                          </ul>
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

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <>
          <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {currentUser ? 'Edit User' : 'Add New User'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        {currentUser ? 'New Password (leave blank to keep current)' : 'Password'}
                      </label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!currentUser}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select 
                        className="form-select" 
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    {/* Course Assignment Section - Only show for instructors */}
                    {formData.role === 'INSTRUCTOR' && (
                      <div className="mb-3">
                        <label className="form-label">Assign Courses</label>
                        {coursesLoading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2">Loading courses...</span>
                          </div>
                        ) : courses.length === 0 ? (
                          <div className="alert alert-info">No courses available to assign</div>
                        ) : (
                          <Select
                            isMulti
                            name="courses"
                            options={courses.map(course => ({
                              value: course.id,
                              label: course.title || course.courseName || `Course #${course.id}`
                            }))}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select courses to assign"
                            value={courses
                              .filter(course => selectedCourses.includes(course.id))
                              .map(course => ({
                                value: course.id,
                                label: course.title || course.courseName || `Course #${course.id}`
                              }))
                            }
                            onChange={handleCourseSelection}
                            isLoading={coursesLoading}
                          />
                        )}
                        <small className="text-muted">Assigned courses will appear in the instructor's dashboard</small>
                      </div>
                    )}
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
                          Processing...
                        </>
                      ) : currentUser ? 'Update User' : 'Add User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={closeModal}></div>
        </>
      )}
    </div>
  );
};

export default Users; 
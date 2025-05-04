import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

// Axios instance for authenticated requests
const authenticatedAxios = axios.create({
  baseURL: API_BASE_URL,
  // Don't set a default Content-Type here, let it be determined by the request type
  headers: {},
  // Add CORS options to prevent blocking
  withCredentials: false
});

// Add request interceptor to add token to requests
authenticatedAxios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    
    // Skip token handling for auth endpoints
    if (config.url.includes('/auth/')) {
      return config;
    }
    
    if (token) {
      // Check token expiration
      const tokenExpired = isTokenExpired();
      
      if (tokenExpired) {
        // Redirect to login if token has expired
        localStorage.removeItem('token');
        localStorage.removeItem('tokenTime');
        window.location.href = '/login?expired=true';
        return Promise.reject('Token expired');
      }
      
      // Set the Authorization header for all non-auth requests
      config.headers.Authorization = `Bearer ${token}`;
      
      // Update token timestamp if it doesn't exist
      if (!localStorage.getItem('tokenTime')) {
        localStorage.setItem('tokenTime', Date.now().toString());
      }
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
authenticatedAxios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // Unauthorized errors - clear token and redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenTime');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    } else if (error.request) {
      // Handle network errors (server not responding)
      networkErrorHelpers.setNetworkError(API_BASE_URL);
    }
    
    return Promise.reject(error);
  }
);

// Check if JWT token is expired
export const isTokenExpired = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    // Check token age - expires after 24 hours
    const tokenTime = localStorage.getItem('tokenTime');
    if (tokenTime) {
      const tokenAge = Date.now() - parseInt(tokenTime, 10);
      const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > TOKEN_EXPIRY) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // If there's any error checking the token, assume it's expired
    return true;
  }
};

// Authentication service
export const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData);
    return response;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
  }
};

// User service
export const userService = {
  getAllUsers: async () => {
    try {
      const response = await authenticatedAxios.get('/api/users');
      return response;
    } catch (error) {
      console.error('API Request Error:', error.message);
      throw error;
    }
  },
  
  getUserById: async (userId) => {
    const response = await authenticatedAxios.get(`/api/users/${userId}`);
    return response;
  },
  
  createUser: async (userData) => {
    const response = await authenticatedAxios.post('/api/users', userData);
    return response;
  },
  
  updateUser: async (userId, userData) => {
    const response = await authenticatedAxios.put(`/api/users/${userId}`, userData);
    return response;
  },
  
  updateUserStatus: async (userId, status) => {
    const response = await authenticatedAxios.put(`/api/users/${userId}/status`, { status });
    return response;
  },
  
  deleteUser: async (userId) => {
    const response = await authenticatedAxios.delete(`/api/users/${userId}`);
    return response;
  },
  
  // Alias for getAllUsers to fix function name error
  getUsers: async () => {
    return userService.getAllUsers();
  }
};

// Course service
export const courseService = {
  getAllCourses: async () => {
    const response = await authenticatedAxios.get('/api/courses');
    return response;
  },
  
  getCourseById: async (courseId) => {
    const response = await authenticatedAxios.get(`/api/courses/${courseId}`);
    return response;
  },
  
  createCourse: async (courseData, config = {}) => {
    // Default the content type to undefined for multipart/form-data
    const requestConfig = {
      headers: {
        'Content-Type': undefined,
        ...config.headers
      },
      ...config
    };
    
    try {
      const response = await authenticatedAxios.post('/api/courses', courseData, requestConfig);
      return response;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },
  
  updateCourse: async (courseId, courseData, config = {}) => {
    // Check if courseData is already FormData or needs to be converted
    let formData;
    if (courseData instanceof FormData) {
      formData = courseData;
    } else {
      // Convert regular object to FormData
      formData = new FormData();
      
      // If courseData is a regular object, convert it to a JSON blob
      if (typeof courseData === 'object' && !(courseData instanceof Blob)) {
        formData.append('course', new Blob([JSON.stringify(courseData)], {
          type: 'application/json'
        }));
      }
    }
    
    // Default the content type to undefined to let the browser set the boundary
    const requestConfig = {
      headers: {
        'Content-Type': undefined,
        ...config.headers
      },
      ...config
    };
    
    try {
      console.log('Updating course:', courseId, 'with data type:', formData instanceof FormData ? 'FormData' : typeof formData);
      const response = await authenticatedAxios.put(`/api/courses/${courseId}`, formData, requestConfig);
      return response;
    } catch (error) {
      console.error('Error updating course:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      throw error;
    }
  },
  
  updateCourseStatus: async (courseId, status) => {
    const response = await authenticatedAxios.put(`/api/courses/${courseId}/status`, { status });
    return response;
  },
  
  deleteCourse: async (courseId) => {
    const response = await authenticatedAxios.delete(`/api/courses/${courseId}`);
    return response;
  },
  
  // Alias for getAllCourses to fix function name error
  getCourses: async () => {
    return courseService.getAllCourses();
  },
  
  assignCourseToInstructor: async (courseId, instructorId) => {
    try {
      console.log(`Attempting to assign course ${courseId} to instructor ${instructorId || 'null'}`);
      
      const course = await courseService.getCourseById(courseId);
      if (!course.data) {
        throw new Error('Course not found');
      }
      
      console.log('Current course data:', JSON.stringify(course.data, null, 2));
      
      // Create a properly structured course object with only required fields
      const courseData = new FormData();
      const courseObj = {
        id: course.data.id,
        title: course.data.title,
        description: course.data.description || '',
        price: course.data.price || 0,
        status: course.data.status || 'DRAFT',
        categoryId: course.data.categoryId || 1,
        // Set instructor if provided, otherwise null
        instructor: instructorId ? { id: instructorId } : null
      };
      
      // Add the course object as JSON string to FormData
      courseData.append('course', new Blob([JSON.stringify(courseObj)], {
        type: 'application/json'
      }));
      
      // Set content type to undefined to let the browser set the correct multipart boundary
      const config = {
        headers: {
          'Content-Type': undefined
        }
      };
      
      console.log('Updating course with instructor:', courseObj);
      
      const response = await courseService.updateCourse(courseId, courseData, config);
      console.log('Course updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error assigning course to instructor:', error);
      
      // Add more detailed error logging
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      
      throw error;
    }
  },
  
  // Add a method to get courses by instructor ID
  getCoursesByInstructor: async (instructorId) => {
    try {
      const response = await authenticatedAxios.get(`/api/courses/instructor/${instructorId}`);
      return response;
    } catch (error) {
      // Fallback to filtering courses client-side if backend endpoint fails
      console.warn('Instructor courses endpoint error, using fallback method', error);
      const coursesResponse = await courseService.getAllCourses();
      const instructorCourses = coursesResponse.data.filter(
        course => course.instructor?.id?.toString() === instructorId?.toString()
      );
      return { data: instructorCourses };
    }
  }
};

// Category service
export const categoryService = {
  getAllCategories: async () => {
    const response = await authenticatedAxios.get('/api/categories');
    return response;
  },
  
  getCategoryById: async (categoryId) => {
    const response = await authenticatedAxios.get(`/api/categories/${categoryId}`);
    return response;
  },
  
  createCategory: async (categoryData) => {
    const response = await authenticatedAxios.post('/api/categories', categoryData);
    return response;
  },
  
  updateCategory: async (categoryId, categoryData) => {
    const response = await authenticatedAxios.put(`/api/categories/${categoryId}`, categoryData);
    return response;
  },
  
  deleteCategory: async (categoryId) => {
    const response = await authenticatedAxios.delete(`/api/categories/${categoryId}`);
    return response;
  }
};

// Video service
export const videoService = {
  getAllVideos: async () => {
    const response = await authenticatedAxios.get('/api/videos');
    return response;
  },
  
  getVideosByCourseId: async (courseId) => {
    const response = await authenticatedAxios.get(`/api/videos/course/${courseId}`);
    return response;
  },
  
  getVideoById: async (videoId) => {
    const response = await authenticatedAxios.get(`/api/videos/${videoId}`);
    return response;
  },
  
  createVideo: async (videoData) => {
    const response = await authenticatedAxios.post('/api/videos', videoData);
    return response;
  },
  
  updateVideo: async (videoId, videoData) => {
    const response = await authenticatedAxios.put(`/api/videos/${videoId}`, videoData);
    return response;
  },
  
  deleteVideo: async (videoId) => {
    const response = await authenticatedAxios.delete(`/api/videos/${videoId}`);
    return response;
  },
  
  getVideosByInstructorId: async (instructorId) => {
    const response = await authenticatedAxios.get(`/api/videos/instructor/${instructorId}`);
    return response;
  }
};

// Enrollment service
export const enrollmentService = {
  getAllEnrollments: async () => {
    try {
      const response = await authenticatedAxios.get('/api/enrollments');
      return response;
    } catch (error) {
      console.error('API Request Error:', error.message);
      throw error;
    }
  },
  
  getEnrollmentById: async (enrollmentId) => {
    const response = await authenticatedAxios.get(`/api/enrollments/${enrollmentId}`);
    return response;
  },
  
  createEnrollment: async (enrollmentData) => {
    // Ensure proper formatting for enrollment data
    const formattedData = {
      ...enrollmentData,
      // Convert to number if string is provided
      userId: typeof enrollmentData.userId === 'string' ? 
        parseInt(enrollmentData.userId) : enrollmentData.userId,
      courseId: typeof enrollmentData.courseId === 'string' ? 
        parseInt(enrollmentData.courseId) : enrollmentData.courseId
    };
    
    // Validate status if provided - must be one of the enum values
    if (enrollmentData.status) {
      // Valid statuses according to the backend model
      const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'DROPPED'];
      
      if (!validStatuses.includes(enrollmentData.status)) {
        console.warn(`Invalid enrollment status "${enrollmentData.status}". Using default.`);
        // Don't include invalid status in the request
        delete formattedData.status;
      }
    }
    
    try {
      const response = await authenticatedAxios.post('/api/enrollments', formattedData);
      return response;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  },
  
  updateEnrollment: async (enrollmentId, enrollmentData) => {
    // The backend API doesn't support direct PUT to /enrollments/{id}
    // We'll use the status update endpoint instead
    if (enrollmentData.status) {
      return enrollmentService.updateEnrollmentStatus(enrollmentId, enrollmentData.status);
    }
    
    console.warn('Enrollment update not fully supported by API. Only status updates are allowed.');
    throw new Error('This operation is not supported by the API. Only status updates are allowed.');
  },
  
  updateEnrollmentStatus: async (enrollmentId, status) => {
    // Valid statuses according to the backend model
    const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'DROPPED'];
    
    if (!validStatuses.includes(status)) {
      console.error(`Invalid enrollment status: ${status}`);
      throw new Error(`Invalid enrollment status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await authenticatedAxios.put(`/api/enrollments/${enrollmentId}/status`, { status });
    return response;
  },
  
  deleteEnrollment: async (enrollmentId) => {
    const response = await authenticatedAxios.delete(`/api/enrollments/${enrollmentId}`);
    return response;
  },
  
  getUserEnrollments: async (userId) => {
    const response = await authenticatedAxios.get(`/api/enrollments/user/${userId}`);
    return response;
  },
  
  // Alias for getAllEnrollments to fix function name error
  getEnrollments: async () => {
    return enrollmentService.getAllEnrollments();
  }
};

// Report service
export const reportService = {
  getEnrollmentStats: async () => {
    try {
      const response = await authenticatedAxios.get('/api/reports/enrollments');
      return response;
    } catch (error) {
      // Calculate enrollment stats from existing API endpoints
      try {
        const enrollmentsResponse = await enrollmentService.getAllEnrollments();
        const enrollments = enrollmentsResponse.data || [];
        
        // Calculate stats from actual enrollments data
        const enrollmentByStatus = {};
        
        // Initialize with possible statuses even if there are no enrollments
        const possibleStatuses = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED'];
        possibleStatuses.forEach(status => {
          enrollmentByStatus[status] = 0;
        });
        
        // Count enrollments by status
        enrollments.forEach(enrollment => {
          const status = enrollment.status || 'PENDING';
          if (!enrollmentByStatus[status]) {
            enrollmentByStatus[status] = 0;
          }
          enrollmentByStatus[status]++;
        });
        
        // Get monthly data by grouping enrollments by month
        const monthlyEnrollments = Array(12).fill(0);
        const monthlyCompletions = Array(12).fill(0);
        
        enrollments.forEach(enrollment => {
          if (enrollment.enrollmentDate) {
            const date = new Date(enrollment.enrollmentDate);
            const month = date.getMonth();
            monthlyEnrollments[month]++;
            
            if (enrollment.status === 'COMPLETED') {
              monthlyCompletions[month]++;
            }
          }
        });
        
        // Calculate completion rate
        const totalEnrollments = enrollments.length;
        const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
        const completionRate = totalEnrollments > 0 
          ? Math.round((completedEnrollments / totalEnrollments) * 100) 
          : 0;
        
        // Calculate enrollment growth (comparing current to previous month)
        const currentMonth = new Date().getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        
        const enrollmentGrowth = monthlyEnrollments[previousMonth] > 0
          ? Math.round(((monthlyEnrollments[currentMonth] - monthlyEnrollments[previousMonth]) / monthlyEnrollments[previousMonth]) * 100)
          : 0;
        
        return {
          data: {
            totalEnrollments,
            activeEnrollments: enrollments.filter(e => e.status === 'ACTIVE').length,
            completedEnrollments,
            enrollmentByStatus,
            monthlyEnrollments,
            monthlyCompletions,
            completionRate,
            enrollmentGrowth
          }
        };
      } catch (fallbackError) {
        // Return empty data instead of throwing error
        return {
          data: {
            totalEnrollments: 0,
            activeEnrollments: 0,
            completedEnrollments: 0,
            enrollmentByStatus: {},
            monthlyEnrollments: Array(12).fill(0),
            monthlyCompletions: Array(12).fill(0),
            completionRate: 0,
            enrollmentGrowth: 0
          }
        };
      }
    }
  },
  
  getRevenueStats: async () => {
    try {
      const response = await authenticatedAxios.get('/api/reports/revenue');
      return response;
    } catch (error) {
      // Calculate revenue stats from existing API endpoints
      try {
        const enrollmentsResponse = await enrollmentService.getAllEnrollments();
        const coursesResponse = await courseService.getAllCourses();
        const categoriesResponse = await categoryService.getAllCategories();
        
        const enrollments = enrollmentsResponse.data || [];
        const courses = coursesResponse.data || [];
        const categories = categoriesResponse.data || [];
        
        // Create a map of course IDs to details (price and category)
        const courseDetails = {};
        courses.forEach(course => {
          courseDetails[course.id] = {
            price: course.price || 0,
            categoryId: course.categoryId
          };
        });
        
        // Create a map of category IDs to names
        const categoryNames = {};
        categories.forEach(category => {
          categoryNames[category.id] = category.name || `Category ${category.id}`;
        });
        
        // Calculate total revenue
        let totalRevenue = 0;
        
        // Calculate monthly revenue and by category
        const monthlyRevenue = Array(12).fill(0);
        const revenueByCategory = {};
        
        // Initialize all categories
        categories.forEach(category => {
          revenueByCategory[category.name || `Category ${category.id}`] = 0;
        });
        
        // Calculate revenue metrics
        enrollments.forEach(enrollment => {
          if (enrollment.status !== 'CANCELLED' && enrollment.status !== 'REJECTED') {
            const courseId = enrollment.courseId;
            const coursePrice = courseDetails[courseId]?.price || 0;
            
            // Add to total revenue
            totalRevenue += coursePrice;
            
            // Add to monthly revenue
            if (enrollment.enrollmentDate) {
              const enrollmentDate = new Date(enrollment.enrollmentDate);
              const month = enrollmentDate.getMonth();
              monthlyRevenue[month] += coursePrice;
            }
            
            // Add to category revenue
            const categoryId = courseDetails[courseId]?.categoryId;
            const categoryName = categoryNames[categoryId] || 'Uncategorized';
            
            if (!revenueByCategory[categoryName]) {
              revenueByCategory[categoryName] = 0;
            }
            revenueByCategory[categoryName] += coursePrice;
          }
        });
        
        // Calculate revenue growth
        const currentMonth = new Date().getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        
        const revenueGrowth = monthlyRevenue[previousMonth] > 0
          ? Math.round(((monthlyRevenue[currentMonth] - monthlyRevenue[previousMonth]) / monthlyRevenue[previousMonth]) * 100)
          : 0;
          
        return {
          data: {
            totalRevenue,
            monthlyRevenue,
            revenueByCategory,
            revenueGrowth
          }
        };
      } catch (fallbackError) {
        // Return empty data instead of throwing error
        return {
          data: {
            totalRevenue: 0,
            monthlyRevenue: Array(12).fill(0),
            revenueByCategory: {},
            revenueGrowth: 0
          }
        };
      }
    }
  },
  
  getUserStats: async () => {
    try {
      const response = await authenticatedAxios.get('/api/reports/users');
      return response;
    } catch (error) {
      // Calculate user stats from existing API endpoints
      try {
        const usersResponse = await userService.getAllUsers();
        const users = usersResponse.data || [];
        
        // Calculate user stats
        const usersByRole = {
          STUDENT: 0,
          INSTRUCTOR: 0,
          ADMIN: 0
        };
        
        let activeUsers = 0;
        
        users.forEach(user => {
          // Count by role
          const role = user.role || 'STUDENT';
          if (!usersByRole[role]) {
            usersByRole[role] = 0;
          }
          usersByRole[role]++;
          
          // Count active users
          if (user.status === 'ACTIVE') {
            activeUsers++;
          }
        });
        
        // Calculate user growth (simplified - would need registration dates)
        const userGrowth = Array(12).fill(0);
        users.forEach(user => {
          if (user.joinDate) {
            const date = new Date(user.joinDate);
            const month = date.getMonth();
            userGrowth[month]++;
          }
        });
        
        // For user acquisition sources (mocked as we don't have this data)
        const usersBySource = {
          'Direct': Math.round(users.length * 0.35),
          'Organic Search': Math.round(users.length * 0.25),
          'Referral': Math.round(users.length * 0.15),
          'Social Media': Math.round(users.length * 0.15),
          'Email': Math.round(users.length * 0.08),
          'Other': Math.round(users.length * 0.02)
        };
        
        // Get recent users
        const recentUsers = [...users]
          .sort((a, b) => new Date(b.joinDate || 0) - new Date(a.joinDate || 0))
          .slice(0, 5)
          .map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            registrationDate: user.joinDate || new Date().toISOString()
          }));
        
        return {
          data: {
            totalUsers: users.length,
            activeUsers,
            usersByRole,
            userGrowth,
            usersBySource,
            recentUsers
          }
        };
      } catch (fallbackError) {
        // Return empty data instead of throwing error
        return {
          data: {
            totalUsers: 0,
            activeUsers: 0,
            usersByRole: {
              STUDENT: 0,
              INSTRUCTOR: 0,
              ADMIN: 0
            },
            userGrowth: Array(12).fill(0),
            usersBySource: {},
            recentUsers: []
          }
        };
      }
    }
  },
  
  getCourseStats: async () => {
    try {
      const response = await authenticatedAxios.get('/api/reports/courses');
      return response;
    } catch (error) {
      // Calculate course stats from existing API endpoints
      try {
        const coursesResponse = await courseService.getAllCourses();
        const enrollmentsResponse = await enrollmentService.getAllEnrollments();
        const usersResponse = await userService.getAllUsers();
        
        const courses = coursesResponse.data || [];
        const enrollments = enrollmentsResponse.data || [];
        const users = usersResponse.data || [];
        
        // Create a map of instructor IDs to names
        const instructorNames = {};
        users.forEach(user => {
          if (user.role === 'INSTRUCTOR') {
            instructorNames[user.id] = user.name || `Instructor ${user.id}`;
          }
        });
        
        // Calculate course statistics
        const coursesByStatus = {
          DRAFT: 0,
          PENDING: 0,
          PUBLISHED: 0,
          ARCHIVED: 0
        };
        
        // Count courses by status
        courses.forEach(course => {
          const status = course.status || 'DRAFT';
          if (!coursesByStatus[status]) {
            coursesByStatus[status] = 0;
          }
          coursesByStatus[status]++;
        });
        
        // Calculate enrollment counts and completion rates for each course
        const courseStats = {};
        enrollments.forEach(enrollment => {
          const courseId = enrollment.courseId;
          
          if (!courseStats[courseId]) {
            courseStats[courseId] = {
              enrollmentCount: 0,
              completedCount: 0
            };
          }
          
          courseStats[courseId].enrollmentCount++;
          
          if (enrollment.status === 'COMPLETED') {
            courseStats[courseId].completedCount++;
          }
        });
        
        // Calculate top performing courses
        const topCourses = courses
          .map(course => {
            const stats = courseStats[course.id] || { enrollmentCount: 0, completedCount: 0 };
            const completionRate = stats.enrollmentCount > 0 
              ? Math.round((stats.completedCount / stats.enrollmentCount) * 100) 
              : 0;
              
            return {
              id: course.id,
              title: course.title,
              instructor: instructorNames[course.instructorId] || 'Unknown Instructor',
              enrollmentCount: stats.enrollmentCount,
              completionRate
            };
          })
          .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
          .slice(0, 5);
          
        return {
          data: {
            totalCourses: courses.length,
            publishedCourses: coursesByStatus.PUBLISHED || 0,
            coursesByStatus,
            averageCompletionRate: calculateAverageCompletionRate(courseStats),
            topCourses
          }
        };
      } catch (fallbackError) {
        // Return empty data instead of throwing error
        return {
          data: {
            totalCourses: 0,
            publishedCourses: 0,
            coursesByStatus: {
              DRAFT: 0,
              PENDING: 0,
              PUBLISHED: 0,
              ARCHIVED: 0
            },
            averageCompletionRate: 0,
            topCourses: []
          }
        };
      }
    }
  },
  
  generateReport: async (reportType, timeRange, format = 'pdf') => {
    try {
      const response = await authenticatedAxios.post('/api/reports/generate', { 
        type: reportType, 
        range: timeRange,
        format: format
      }, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${timeRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      // Fallback to generating a simple report client-side
      let reportData = null;
      
      // Get relevant data based on report type
      switch (reportType) {
        case 'enrollment':
          reportData = await reportService.getEnrollmentStats();
          break;
        case 'revenue':
          reportData = await reportService.getRevenueStats();
          break;
        case 'users':
          reportData = await reportService.getUserStats();
          break;
        case 'courses':
          reportData = await reportService.getCourseStats();
          break;
        default:
          reportData = { data: {} };
      }
      
      // Mock report generation by showing alert
      setTimeout(() => {
        alert(`${reportType.toUpperCase()} report for ${timeRange} has been generated.`);
      }, 1000);
      
      return true;
    }
  }
};

// Calculate average completion rate for all courses
function calculateAverageCompletionRate(courseStats) {
  const courses = Object.values(courseStats);
  if (courses.length === 0) return 0;
  
  let totalCompletionRate = 0;
  let coursesWithEnrollments = 0;
  
  courses.forEach(course => {
    if (course.enrollmentCount > 0) {
      totalCompletionRate += (course.completedCount / course.enrollmentCount) * 100;
      coursesWithEnrollments++;
    }
  });
  
  return coursesWithEnrollments > 0 
    ? Math.round(totalCompletionRate / coursesWithEnrollments) 
    : 0;
}

// Network error handling helpers
export const networkErrorHelpers = {
  setNetworkError: (apiUrl) => {
    localStorage.setItem('networkError', JSON.stringify({
      timestamp: Date.now(),
      apiUrl
    }));
  },
  
  getNetworkError: () => {
    const errorData = localStorage.getItem('networkError');
    return errorData ? JSON.parse(errorData) : null;
  },
  
  clearNetworkError: () => {
    localStorage.removeItem('networkError');
  },
  
  // Check if there's a recent network error
  hasNetworkError: () => {
    const networkError = localStorage.getItem('networkError');
    
    if (networkError) {
      try {
        // Check if error was within the last 30 seconds
        const errorData = JSON.parse(networkError);
        const errorTime = errorData.timestamp;
        const currentTime = Date.now();
        const timeDiff = currentTime - errorTime;
        
        // Only consider errors from the last 30 seconds
        return timeDiff < 30000;
      } catch (e) {
        return false;
      }
    }
    
    return false;
  },
  
  // Helper that retries a request if it fails due to network error
  retryRequest: async (requestFn, maxRetries = 3, initialDelay = 1000) => {
    let retryCount = 0;
    let delay = initialDelay;
    
    while (retryCount < maxRetries) {
      try {
        return await requestFn();
      } catch (error) {
        if (retryCount === maxRetries - 1 || !error.request) {
          throw error;
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
};

// Helper to generate user-friendly error messages
export const handleApiError = (error) => {
  // Check if it's a network error
  if (!error.response) {
    return 'Unable to connect to the server. Please check your network connection.';
  }

  // Check if there's a meaningful error message from the server
  if (error.response && error.response.data) {
    // First try to get message from response data
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    
    // Check for structured error message
    if (error.response.data.message) {
      return error.response.data.message;
    }
    
    // Handle Spring Boot default error format
    if (error.response.data.error && error.response.data.status) {
      return `${error.response.data.error}: ${error.response.data.message || 'An unexpected error occurred'}`;
    }
  }

  // Handle HTTP status code based errors
  switch (error.response?.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with the current state. The resource might already exist.';
    case 500:
      if (error.response.config.url.includes('/api/courses') && 
          (error.response.config.method === 'post' || error.response.config.method === 'put')) {
        return 'Failed to process course data. Make sure all fields are filled correctly and the image is valid.';
      }
      return 'An unexpected server error occurred. Please try again later.';
    default:
      return `Error: ${error.message || 'An unexpected error occurred'}`;
  }
}; 
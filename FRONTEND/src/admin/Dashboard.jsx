import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { courseService, userService, enrollmentService, handleApiError, networkErrorHelpers } from '../services/api';
import axios from 'axios';
import { reportService } from '../services/api';
import ImageWithFallback from '../components/common/ImageWithFallback';

// Import token and fallback data functions from api.js
import { isTokenExpired } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [userData, setUserData] = useState({});
  const [courseData, setCourseData] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      navigate('/login');
    } else if (role !== 'ADMIN') {
      navigate('/unauthorized');
    }
  }, [navigate]);

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
      // Fetch analytics data in parallel, with error handling for each request
      let enrollmentStats = { data: {} };
      let revenueStats = { data: {} };
      let userStats = { data: {} };
      let courseStats = { data: {} };
      
      try {
        // Check token validity to avoid unnecessary API calls
        const tokenValid = localStorage.getItem('token') && 
                         !isTokenExpired();
        
        if (tokenValid) {
          // Use the retryRequest helper for better network resilience
          [enrollmentStats, revenueStats, userStats, courseStats] = await Promise.all([
            networkErrorHelpers.retryRequest(() => reportService.getEnrollmentStats()),
            networkErrorHelpers.retryRequest(() => reportService.getRevenueStats()),
            networkErrorHelpers.retryRequest(() => reportService.getUserStats()),
            networkErrorHelpers.retryRequest(() => reportService.getCourseStats())
          ]);
          
          // Clear any network errors if successful
          networkErrorHelpers.clearNetworkError();
          
          // Also fetch raw data for charts
          const coursesResponse = await courseService.getAllCourses();
          const usersResponse = await userService.getAllUsers();
          const enrollmentsResponse = await enrollmentService.getAllEnrollments();
          
          setCourses(coursesResponse.data || []);
          setUsers(usersResponse.data || []);
          setEnrollments(enrollmentsResponse.data || []);
          
          // Set computed stats based on raw data
          setTotalUsers(usersResponse.data?.length || 0);
          setActiveCourses(coursesResponse.data?.filter(c => c.status === 'PUBLISHED')?.length || 0);
          
          // Calculate completion rate
          const totalEnrollments = enrollmentsResponse.data?.length || 0;
          const completedEnrollments = enrollmentsResponse.data?.filter(e => e.status === 'COMPLETED')?.length || 0;
          const rate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
          setCompletionRate(rate);
          
          // Calculate pending approvals (courses or enrollments pending review)
          const pendingCourses = coursesResponse.data?.filter(c => c.status === 'PENDING')?.length || 0;
          const pendingEnrollments = enrollmentsResponse.data?.filter(e => e.status === 'PENDING')?.length || 0;
          setPendingApprovals(pendingCourses + pendingEnrollments);
          
          // Generate activity feed
          generateRecentActivity(usersResponse.data || [], coursesResponse.data || []);
        }
      } catch (apiError) {
        // Continue with any data we managed to fetch
        setError('Some dashboard data could not be loaded. Please refresh to try again.');
      }

      // Update state with fetched data, safely handling undefined data
      setEnrollmentData(enrollmentStats?.data || {});
      setRevenueData(revenueStats?.data || {});
      setUserData(userStats?.data || {});
      setCourseData(courseStats?.data || {});
      
      // Set latest activities from these responses, with defensive coding
      const activities = [
        ...((enrollmentStats?.data?.recentEnrollments || []).map((item, index) => ({
          id: `enrollment-${item?.enrollmentId || index}-${Date.now()}`,
          type: 'enrollment',
          title: `New enrollment in ${item?.courseName || 'Unknown Course'}`,
          time: item?.enrollmentDate || new Date().toISOString(),
          user: item?.userName || 'Unknown User',
          action: 'enrolled in'
        })) || []),
        ...((userStats?.data?.recentUsers || []).map((item, index) => ({
          id: `user-${item?.id || index}-${Date.now()}`,
          type: 'user',
          title: 'New user registered',
          time: item?.registrationDate || new Date().toISOString(),
          user: item?.name || 'Unknown User',
          action: 'registered as'
        })) || []),
        ...((courseStats?.data?.recentCourses || []).map((item, index) => ({
          id: `course-${item?.id || index}-${Date.now()}`,
          type: 'course',
          title: `New course: ${item?.title || 'Unknown Course'}`,
          time: item?.createdAt || new Date().toISOString(),
          user: item?.instructorName || 'Unknown Instructor',
          action: 'created'
        })) || [])
      ];
      
      // Sort by date, most recent first
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      // Take only the most recent activities
      setRecentActivities(activities.slice(0, 10));
      
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Generate recent activity from users and courses data
  const generateRecentActivity = (users, courses) => {
    const activities = [];
    
    // Add newest users (if any)
    if (users.length > 0) {
      // Sort by join date descending
      const sortedUsers = [...users].sort((a, b) => 
        new Date(b.joinDate || b.createdAt || Date.now()) - new Date(a.joinDate || a.createdAt || Date.now())
      );
      
      // Take up to 5 newest users
      sortedUsers.slice(0, 5).forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          user: user.name,
          action: 'joined as',
          target: user.role.toLowerCase(),
          time: formatTimeAgo(user.joinDate || user.createdAt || Date.now())
        });
      });
    }
    
    // Add newest courses (if any)
    if (courses.length > 0) {
      // Sort by creation date descending
      const sortedCourses = [...courses].sort((a, b) => 
        new Date(b.createdAt || b.created_at || Date.now()) - new Date(a.createdAt || a.created_at || Date.now())
      );
      
      // Take up to 5 newest courses
      sortedCourses.slice(0, 5).forEach(course => {
        activities.push({
          id: `course-${course.id}`,
          user: course.instructor?.name || 'An instructor',
          action: 'submitted',
          target: course.title,
          time: formatTimeAgo(course.createdAt || course.created_at || Date.now())
        });
      });
    }
    
    // Sort activities by date, most recent first
    activities.sort((a, b) => {
      const timeA = a.time.includes('ago') ? a.time : new Date(a.time);
      const timeB = b.time.includes('ago') ? b.time : new Date(b.time);
      
      // For 'ago' strings, compare by number (extract the number from the string)
      if (typeof timeA === 'string' && typeof timeB === 'string') {
        const numA = parseInt(timeA.split(' ')[0]);
        const numB = parseInt(timeB.split(' ')[0]);
        
        // Check if both contain 'minute', 'hour', or 'day'
        if (timeA.includes('minute') && timeB.includes('minute')) {
          return numB - numA;
        } else if (timeA.includes('hour') && timeB.includes('hour')) {
          return numB - numA;
        } else if (timeA.includes('day') && timeB.includes('day')) {
          return numB - numA;
        } else if (timeA.includes('minute') && timeB.includes('hour')) {
          return -1; // minutes are more recent than hours
        } else if (timeA.includes('hour') && timeB.includes('minute')) {
          return 1; // hours are less recent than minutes
        } else if (timeA.includes('minute') && timeB.includes('day')) {
          return -1; // minutes are more recent than days
        } else if (timeA.includes('day') && timeB.includes('minute')) {
          return 1; // days are less recent than minutes
        } else if (timeA.includes('hour') && timeB.includes('day')) {
          return -1; // hours are more recent than days
        } else if (timeA.includes('day') && timeB.includes('hour')) {
          return 1; // days are less recent than hours
        }
      }
      
      // For dates, compare them directly
      return new Date(timeB) - new Date(timeA);
    });
    
    setRecentActivity(activities);
  };

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;
      
      // Convert to minutes, hours, days
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return past.toLocaleDateString();
      }
    } catch (error) {
      return 'recently';
    }
  };

  // Generate chart data
  const generateSignupData = () => {
    // Get last 7 months
    const months = [];
    const counts = [];
    
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(month.toLocaleString('default', { month: 'short' }));
      
      // Count users who joined in this month
      const monthUsers = users.filter(user => {
        if (!user.joinDate) return false;
        const joinDate = new Date(user.joinDate);
        return joinDate.getMonth() === month.getMonth() && 
               joinDate.getFullYear() === month.getFullYear();
      });
      
      // Only use actual user count data, no random fallback
      counts.push(monthUsers.length);
    }
    
    return {
      labels: months,
      datasets: [
        {
          label: 'User Signups',
          data: counts,
          fill: true,
          backgroundColor: 'rgba(67, 97, 238, 0.2)',
          borderColor: 'rgba(67, 97, 238, 1)',
          tension: 0.4,
        },
      ],
    };
  };

  // Sample data for course engagement - using course data if available
  const generateEngagementData = () => {
    if (courses.length === 0) {
      // Return empty data structure instead of mock data
      return {
        labels: [],
        datasets: [
          {
            label: 'Enrollments',
            data: [],
            backgroundColor: 'rgba(67, 97, 238, 0.8)',
          },
          {
            label: 'Completions',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
          }
        ]
      };
    }
    
    // Take up to 5 courses
    const topCourses = courses.slice(0, 5);
    const labels = topCourses.map(course => course.title);
    
    // Count enrollments per course
    const enrollmentData = topCourses.map(course => {
      const courseEnrollments = enrollments.filter(e => 
        e.course?.id === course.id || e.courseId === course.id
      );
      return courseEnrollments.length;
    });
    
    // Count completions per course
    const completionData = topCourses.map(course => {
      const courseCompletions = enrollments.filter(e => 
        (e.course?.id === course.id || e.courseId === course.id) && 
        (e.status === 'COMPLETED' || e.status === 'Completed')
      );
      return courseCompletions.length;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Enrollments',
          data: enrollmentData,
          backgroundColor: 'rgba(67, 97, 238, 0.8)',
        },
        {
          label: 'Completions',
          data: completionData,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  };

  // Generate user distribution data
  const generateUserDistributionData = () => {
    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const instructorCount = users.filter(u => u.role === 'INSTRUCTOR').length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    
    return {
      labels: ['Students', 'Instructors', 'Admins'],
      datasets: [
        {
          data: [studentCount, instructorCount, adminCount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Handle quick action buttons
  const handleAddUser = () => {
    navigate('/admin/users');
  };
  
  const handleReviewCourses = () => {
    navigate('/admin/courses');
  };
  
  const handleManageEnrollments = () => {
    navigate('/admin/enrollments');
  };
  
  const handleSendNotification = () => {
    navigate('/admin/notifications');
  };
  
  const handleGenerateReport = () => {
    navigate('/admin/reports');
  };

  // Stats data based on real values
  const stats = [
    { title: 'Total Users', value: totalUsers.toString(), icon: 'bi-people-fill', color: 'primary' },
    { title: 'Active Courses', value: activeCourses.toString(), icon: 'bi-book-fill', color: 'success' },
    { title: 'Completion Rate', value: `${completionRate}%`, icon: 'bi-award-fill', color: 'warning' },
    { title: 'Pending Approvals', value: pendingApprovals.toString(), icon: 'bi-hourglass-split', color: 'danger' },
  ];

  if (loading && users.length === 0 && courses.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}
      
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

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <motion.div 
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">User Signups</h5>
            </div>
            <div className="card-body">
              <Line 
                data={generateSignupData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
        <div className="col-lg-4">
          <motion.div 
            className="card border-0 shadow-sm h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">User Distribution</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <div style={{ maxHeight: '250px' }}>
                <Doughnut 
                  data={generateUserDistributionData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <motion.div 
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Course Engagement</h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="timeRangeDropdown" data-bs-toggle="dropdown">
                  Last 7 Days
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><button className="dropdown-item">Today</button></li>
                  <li><button className="dropdown-item">Last 7 Days</button></li>
                  <li><button className="dropdown-item">Last 30 Days</button></li>
                  <li><button className="dropdown-item">Last 90 Days</button></li>
                </ul>
              </div>
            </div>
            <div className="card-body">
              <Bar 
                data={generateEngagementData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
        <div className="col-lg-5">
          <motion.div 
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">Recent Activity</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {recentActivities.map((activity) => (
                  <div className="list-group-item border-start-0 border-end-0 py-3" key={activity.id}>
                    <div className="d-flex align-items-center">
                      <div className="avatar rounded-circle bg-light text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-person"></i>
                      </div>
                      <div>
                        <p className="mb-0">
                          <span className="fw-medium">{activity.user}</span>
                          <span className="text-muted"> {activity.action} </span>
                          <span className="fw-medium">{activity.target}</span>
                        </p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-white py-3 text-center">
              <button className="btn btn-link" onClick={() => fetchData()}>Refresh Activity</button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <motion.div 
        className="card border-0 shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="d-grid">
                <button className="btn btn-outline-primary" onClick={handleAddUser}>
                  <i className="bi bi-person-plus-fill mb-2 fs-4 d-block"></i>
                  Add New User
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-grid">
                <button className="btn btn-outline-success" onClick={handleReviewCourses}>
                  <i className="bi bi-check-circle-fill mb-2 fs-4 d-block"></i>
                  Review Courses
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-grid">
                <button className="btn btn-outline-warning" onClick={handleManageEnrollments}>
                  <i className="bi bi-mortarboard-fill mb-2 fs-4 d-block"></i>
                  Manage Enrollments
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-grid">
                <button className="btn btn-outline-info" onClick={handleSendNotification}>
                  <i className="bi bi-bell-fill mb-2 fs-4 d-block"></i>
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 
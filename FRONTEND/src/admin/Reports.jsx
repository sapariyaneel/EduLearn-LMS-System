import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
import { reportService } from '../services/api';

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

const Reports = () => {
  const [reportType, setReportType] = useState('enrollment');
  const [timeRange, setTimeRange] = useState('7days');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // State for real-time data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  // Function to fetch all analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all analytics data in parallel
      const [enrollmentStatsRes, revenueStatsRes, userStatsRes, courseStatsRes] = await Promise.all([
        reportService.getEnrollmentStats(),
        reportService.getRevenueStats(),
        reportService.getUserStats(),
        reportService.getCourseStats()
      ]);
      
      // Process enrollment data for charts
      const enrollmentChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Course Enrollments',
            data: enrollmentStatsRes.data.monthlyEnrollments || [],
            fill: true,
            backgroundColor: 'rgba(67, 97, 238, 0.2)',
            borderColor: 'rgba(67, 97, 238, 1)',
            tension: 0.4,
          },
          {
            label: 'Course Completions',
            data: enrollmentStatsRes.data.monthlyCompletions || [],
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.4,
          },
        ],
      };
      setEnrollmentData(enrollmentChartData);
      
      // Process revenue data for charts
      const revenueChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Revenue (USD)',
            data: revenueStatsRes.data.monthlyRevenue || [],
            backgroundColor: 'rgba(75, 192, 92, 0.8)',
          },
        ],
      };
      setRevenueData(revenueChartData);
      
      // Process user acquisition data
      const userSourceLabels = Object.keys(userStatsRes.data.usersBySource || {});
      const userSourceValues = Object.values(userStatsRes.data.usersBySource || {});
      
      const userAcquisitionChartData = {
        labels: userSourceLabels.length ? userSourceLabels : ['Direct', 'Organic Search', 'Referral', 'Social Media', 'Email', 'Other'],
        datasets: [
          {
            data: userSourceValues.length ? userSourceValues : [35, 25, 15, 15, 8, 2],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
      setUserStats(userAcquisitionChartData);
      
      // Update platform stats
      const newPlatformStats = [
        { 
          title: 'Total Enrollments', 
          value: enrollmentStatsRes.data.totalEnrollments?.toLocaleString() || '0', 
          icon: 'bi-mortarboard-fill', 
          color: 'primary', 
          change: enrollmentStatsRes.data.enrollmentGrowth ? `+${enrollmentStatsRes.data.enrollmentGrowth}%` : '+0%' 
        },
        { 
          title: 'Active Students', 
          value: userStatsRes.data.activeUsers?.toLocaleString() || '0', 
          icon: 'bi-people-fill', 
          color: 'success', 
          change: userStatsRes.data.userGrowth ? `+${userStatsRes.data.userGrowth}%` : '+0%' 
        },
        { 
          title: 'Course Completion Rate', 
          value: `${enrollmentStatsRes.data.completionRate || 0}%`, 
          icon: 'bi-check-circle-fill', 
          color: 'warning', 
          change: enrollmentStatsRes.data.completionRateChange ? `+${enrollmentStatsRes.data.completionRateChange}%` : '+0%' 
        },
        { 
          title: 'Revenue', 
          value: `$${revenueStatsRes.data.totalRevenue?.toLocaleString() || '0'}`, 
          icon: 'bi-cash-stack', 
          color: 'info', 
          change: revenueStatsRes.data.revenueGrowth ? `+${revenueStatsRes.data.revenueGrowth}%` : '+0%' 
        },
      ];
      setPlatformStats(newPlatformStats);
      
      // Update popular courses
      if (courseStatsRes.data.topCourses && courseStatsRes.data.topCourses.length) {
        setPopularCourses(courseStatsRes.data.topCourses.map(course => ({
          id: course.id,
          title: course.title,
          enrollments: course.enrollmentCount,
          completionRate: course.completionRate,
          instructor: course.instructor
        })));
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle generating CSV/PDF reports
  const handleGenerateReport = (format) => {
    setIsGeneratingReport(true);
    
    // Make an actual API call to generate the report
    reportService.generateReport(reportType, timeRange, format)
      .then(() => {
        setIsGeneratingReport(false);
        alert(`${format.toUpperCase()} report has been generated successfully!`);
      })
      .catch(error => {
        setIsGeneratingReport(false);
        alert(`Failed to generate ${format.toUpperCase()} report. Please try again later.`);
      });
  };
  
  // Default data as fallback if API data is not available yet
  const defaultEnrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Course Enrollments',
        data: [125, 140, 210, 180, 170, 245, 260, 310, 290, 350, 370, 410],
        fill: true,
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: 'rgba(67, 97, 238, 1)',
        tension: 0.4,
      },
      {
        label: 'Course Completions',
        data: [70, 85, 120, 95, 110, 130, 150, 160, 170, 195, 210, 230],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  };
  
  const defaultRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (USD)',
        data: [12500, 14200, 21000, 18500, 19000, 24500, 26000, 31000, 29500, 35000, 37500, 42000],
        backgroundColor: 'rgba(75, 192, 92, 0.8)',
      },
    ],
  };
  
  const defaultUserAcquisitionData = {
    labels: ['Direct', 'Organic Search', 'Referral', 'Social Media', 'Email', 'Other'],
    datasets: [
      {
        data: [35, 25, 15, 15, 8, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const defaultPopularCourses = [
    { id: 1, title: 'Advanced Machine Learning', enrollments: 345, completionRate: 68, instructor: 'Dr. Sarah Johnson' },
    { id: 2, title: 'Web Development Masterclass', enrollments: 289, completionRate: 73, instructor: 'Michael Chen' },
    { id: 3, title: 'Digital Marketing Strategy', enrollments: 256, completionRate: 61, instructor: 'Emily Rodriguez' },
    { id: 4, title: 'Data Science Fundamentals', enrollments: 234, completionRate: 59, instructor: 'David Kim' },
    { id: 5, title: 'UI/UX Design Principles', enrollments: 218, completionRate: 64, instructor: 'Jennifer Lee' },
  ];
  
  const defaultPlatformStats = [
    { title: 'Total Enrollments', value: '2,856', icon: 'bi-mortarboard-fill', color: 'primary', change: '+12.5%' },
    { title: 'Active Students', value: '1,487', icon: 'bi-people-fill', color: 'success', change: '+8.2%' },
    { title: 'Course Completion Rate', value: '65.4%', icon: 'bi-check-circle-fill', color: 'warning', change: '+5.3%' },
    { title: 'Revenue', value: '$45,850', icon: 'bi-cash-stack', color: 'info', change: '+15.7%' },
  ];
  
  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Loading analytics data...</span>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
        <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchAnalyticsData}>
          <i className="bi bi-arrow-clockwise me-1"></i> Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="reports-analytics">
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {(platformStats.length ? platformStats : defaultPlatformStats).map((stat, index) => (
          <div className="col-md-6 col-xl-3" key={index}>
            <motion.div 
              className={`card border-0 shadow-sm h-100`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded me-3`}>
                    <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                  </div>
                  <div>
                    <h6 className="fw-normal text-muted mb-0">{stat.title}</h6>
                    <h4 className="fw-bold mb-0">{stat.value}</h4>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <span className={`badge bg-${stat.change.startsWith('+') ? 'success' : 'danger'} me-2`}>
                    <i className={`bi ${stat.change.startsWith('+') ? 'bi-arrow-up' : 'bi-arrow-down'} me-1`}></i>
                    {stat.change}
                  </span>
                  <small className="text-muted">vs last month</small>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      
      {/* Report Controls */}
      <motion.div 
        className="card border-0 shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Report Generation</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Report Type</label>
              <select 
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="enrollment">Course Enrollments</option>
                <option value="revenue">Revenue</option>
                <option value="users">User Activity</option>
                <option value="completion">Course Completions</option>
                <option value="instructors">Instructor Performance</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Time Range</label>
              <select 
                className="form-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            {timeRange === 'custom' && (
              <div className="col-md-4">
                <label className="form-label">Custom Date Range</label>
                <div className="d-flex">
                  <input type="date" className="form-control me-2" />
                  <span className="align-self-center">to</span>
                  <input type="date" className="form-control ms-2" />
                </div>
              </div>
            )}
            <div className="col-md-4 d-flex align-items-end">
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleGenerateReport('csv')}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                      Export CSV
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-primary"
                  onClick={() => handleGenerateReport('pdf')}
                  disabled={isGeneratingReport}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <motion.div 
            className="card border-0 shadow-sm h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Course Enrollment & Completion Trends</h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="timeRangeDropdown" data-bs-toggle="dropdown">
                  Last 12 Months
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><button className="dropdown-item">Last 30 Days</button></li>
                  <li><button className="dropdown-item">Last 3 Months</button></li>
                  <li><button className="dropdown-item">Last 6 Months</button></li>
                  <li><button className="dropdown-item">Last 12 Months</button></li>
                </ul>
              </div>
            </div>
            <div className="card-body">
              <Line 
                data={enrollmentData || defaultEnrollmentData}
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
            transition={{ delay: 0.6 }}
          >
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">User Acquisition</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <div style={{ maxHeight: '250px', maxWidth: '250px' }}>
                <Pie 
                  data={userStats || defaultUserAcquisitionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
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
        <div className="col-12">
          <motion.div 
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">Revenue Overview</h5>
            </div>
            <div className="card-body">
              <Bar 
                data={revenueData || defaultRevenueData}
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
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₹' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Popular Courses Table */}
      <motion.div 
        className="card border-0 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">Top Performing Courses</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th scope="col">Course Title</th>
                <th scope="col">Instructor</th>
                <th scope="col">Enrollments</th>
                <th scope="col">Completion Rate</th>
                <th scope="col">Performance</th>
              </tr>
            </thead>
            <tbody>
              {(popularCourses.length ? popularCourses : defaultPopularCourses).map(course => (
                <tr key={course.id}>
                  <td>
                    <h6 className="mb-0">{course.title}</h6>
                  </td>
                  <td>{course.instructor}</td>
                  <td>{course.enrollments}</td>
                  <td>{course.completionRate}%</td>
                  <td>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar ${
                          course.completionRate >= 70 ? 'bg-success' : 
                          course.completionRate >= 50 ? 'bg-warning' : 'bg-danger'
                        }`} 
                        role="progressbar" 
                        style={{ width: `${course.completionRate}%` }} 
                        aria-valuenow={course.completionRate} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white py-3 text-center">
          <button className="btn btn-link">View All Courses</button>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports; 
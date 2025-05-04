import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { networkErrorHelpers } from '../services/api';

const InstructorLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check token once on component mount
  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check if user is an instructor
    const role = localStorage.getItem('role');
    if (role !== 'INSTRUCTOR') {
      // Redirect non-instructors to appropriate dashboard
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/userdashboard');
      }
      return;
    }
    
    // Update token time on component mount
    localStorage.setItem("tokenTime", Date.now().toString());
  }, [navigate]); 

  // Check for network errors periodically
  useEffect(() => {
    const checkNetworkStatus = () => {
      const networkStatusElement = document.getElementById('network-status');
      if (networkStatusElement) {
        if (networkErrorHelpers.hasNetworkError()) {
          const errorDetails = localStorage.getItem('networkErrorDetails') || 
            'Network connection issue detected. Please check your internet connection.';
          networkStatusElement.innerHTML = errorDetails;
          networkStatusElement.style.display = 'block';
        } else {
          networkStatusElement.style.display = 'none';
        }
      }
    };
    
    // Check immediately
    checkNetworkStatus();
    
    // Then check every 5 seconds
    const intervalId = setInterval(checkNetworkStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const logout = (event) => {
    event.preventDefault();
    
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("tokenTime");
    
    // Navigate to login page
    navigate("/login");
  };

  const menuItems = [
    { path: '/instructor/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/instructor/videos', icon: 'bi-film', label: 'My Course Videos' },
    { path: '/instructor/courses', icon: 'bi-book', label: 'My Courses' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="d-flex h-100">
      {/* Network Status Alert */}
      <div 
        id="network-status" 
        className="alert alert-warning alert-dismissible fade show position-fixed w-100 text-center mb-0" 
        role="alert"
        style={{ 
          top: 0, 
          left: 0, 
          zIndex: 1060, 
          display: 'none',
          borderRadius: 0 
        }}
      >
        Network connection issue detected. Please check your internet connection.
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => networkErrorHelpers.clearNetworkError()}
        ></button>
      </div>
      
      {/* Sidebar */}
      <motion.div 
        className={`bg-dark text-white sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
        initial={{ width: isSidebarCollapsed ? '80px' : '250px' }}
        animate={{ width: isSidebarCollapsed ? '80px' : '250px' }}
        transition={{ duration: 0.3 }}
        style={{ 
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100
        }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fs-4 fw-bold text-primary"
            >
              EduLearn Instructor
            </motion.span>
          )}
          <button 
            className="btn btn-sm text-white"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          >
            <i className={`bi ${isSidebarCollapsed ? 'bi-arrow-right' : 'bi-arrow-left'}`}></i>
          </button>
        </div>
        
        {/* Menu */}
        <nav className="mt-3">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link py-3 ${isActive(item.path) ? 'active bg-primary text-white' : 'text-white-50'}`}
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: isSidebarCollapsed ? '80px' : '250px',
        width: '100%',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Navbar */}
        <nav className="navbar navbar-expand navbar-light bg-white shadow-sm">
          <div className="container-fluid">
            <span className="navbar-brand d-none d-md-block">
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </span>
            
            <div className="ms-auto d-flex align-items-center">
              <div className="dropdown">
                <button className="btn d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                  <div className="me-2 d-none d-md-block text-end">
                    <div className="fw-bold">{localStorage.getItem('name') || 'Instructor'}</div>
                    <div className="small text-muted">Instructor</div>
                  </div>
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-person"></i>
                  </div>
                </button>
                <div className="dropdown-menu dropdown-menu-end shadow">
                  <button className="dropdown-item">
                    <i className="bi bi-person me-2"></i> Profile
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout; 
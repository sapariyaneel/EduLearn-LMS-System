import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Navigation from "./Navigation.jsx";
import Footer from "../marketing/Footer.jsx";
import { motion } from 'framer-motion';
import CollaborationSection from "./CollaborationSection.jsx";
import InvestInCareer from "./InvestInCareer.jsx";
import CourseSection from "./CourseSection.jsx";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("Student");
  const isLanding = false;
  const isHomePage = location.pathname === '/userdashboard';

  useEffect(() => {
    // Get user info from local storage
    const name = localStorage.getItem("name");
    if (name) {
      setUserName(name);
    }
  }, []);

  const logout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("tokenTime");
    navigate("/login");
  };

  return (
    <div className={`d-flex flex-column ${isLanding ? 'landing-layout' : 'app-layout'}`}>
      <Navigation />
      
      {isHomePage && (
        <>
          <section className="py-5 bg-light text-dark text-center">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6 mb-4 mb-md-0">
                  <h1 className="display-4 fw-bold">Welcome to EduLearn, {userName}</h1>
                  <p className="lead">
                    Learn new skills, upgrade your career, and achieve your dreams with our online courses.
                  </p>
                  <Link to="/userdashboard/courses" className="btn btn-primary btn-lg me-3">Explore Courses</Link>
                  <Link to="/userdashboard/my-enrollments" className="btn btn-outline-primary btn-lg">My Enrollments</Link>
                </div>
                <div className="col-md-6">
                  <img 
                    src="https://img.freepik.com/free-vector/e-learning-concept-illustration_114360-4764.jpg" 
                    alt="EduLearn Hero"
                    className="img-fluid rounded-3 shadow"
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Only show these components on the home page */}
          <Outlet />
        </>
      )}
      
      {!isHomePage && (
        <div className="container py-4">
          <div className="d-flex">
            {/* Sidebar */}
            <motion.div
              className="p-4 shadow rounded me-4"
              style={{ minWidth: '250px', minHeight: '80vh' }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h5 className="text-primary fw-bold mb-4">Dashboard</h5>
              <nav className="nav flex-column">
                <Link to="/userdashboard/courses" className={`nav-link ${location.pathname === '/userdashboard/courses' ? 'active bg-light' : ''}`}>
                  <i className="bi bi-book me-2"></i> Browse Courses
                </Link>
                <Link to="/userdashboard/my-enrollments" className={`nav-link ${location.pathname === '/userdashboard/my-enrollments' ? 'active bg-light' : ''}`}>
                  <i className="bi bi-mortarboard me-2"></i> My Enrollments
                </Link>
                <hr />
                <button onClick={logout} className="btn btn-outline-danger mt-5 w-100">
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </nav>
            </motion.div>

            {/* Main Content */}
            <motion.div
              className="flex-grow-1 p-4 shadow rounded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default UserDashboard;

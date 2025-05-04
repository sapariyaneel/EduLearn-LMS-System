import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import 'bootstrap-icons/font/bootstrap-icons.css';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    if (token) {
      setIsLoggedIn(true);
      setUsername(name || 'User');
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg navbar-light fixed-top ${isScrolled ? 'bg-white shadow-sm' : 'bg-white shadow-sm'}`}> <br></br><br />
      <div className="container">
        <motion.a 
          className="navbar-brand d-flex align-items-center" 
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary fw-bold fs-4">EduLearn</span>
        </motion.a>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <motion.ul 
            className="navbar-nav ms-auto mb-2 mb-lg-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <motion.li 
              className="nav-item"
              whileHover={{ scale: 1.05 }}
            >
              <a className="nav-link active" href="">Home</a>
            </motion.li>
            <motion.li 
              className="nav-item"
              whileHover={{ scale: 1.05 }}
            >
              <a className="nav-link" href="#features">Features</a>
            </motion.li>
            <motion.li 
              className="nav-item"
              whileHover={{ scale: 1.05 }}
            >
              <a className="nav-link" href="#how-it-works">How it Works</a>
            </motion.li>
            <motion.li 
              className="nav-item"
              whileHover={{ scale: 1.05 }}
            >
              <a className="nav-link" href="#testimonials">Testimonials</a>
            </motion.li>
          </motion.ul>
          <div className="d-flex mt-3 mt-lg-0 ms-lg-3">
            {isLoggedIn ? (
              <div className="user-welcome d-flex align-items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="me-2 d-flex align-items-center"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  <span>Welcome, {username}</span>
                </motion.div>
                {localStorage.getItem('role') === 'ADMIN' ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-outline-primary ms-2"
                  >
                    <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>Admin Panel</Link>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-outline-primary ms-2"
                  >
                    <Link to="/userdashboard" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline-primary me-2"
                >
                  <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>Log In</Link>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary"
                >
                  <Link to="/register_user" style={{ textDecoration: 'none', color: 'inherit' }}>Sign Up</Link>  
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
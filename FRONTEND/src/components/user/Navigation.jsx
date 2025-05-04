import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CartIcon from '../../CartIcon';
import './Navigation.css'; // Custom CSS

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleMyCourses = () => {
    navigate("/userdashboard/my-enrollments");
  };

  const handleSearch = () => {
    console.log("Search for:", searchQuery);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-light fixed-top ${isScrolled ? 'bg-white shadow-sm' : 'bg-white shadow-sm'}`}>
      <div className="container d-flex justify-content-between align-items-center">

        {/* Logo */}
        <motion.a
          className="navbar-brand d-flex align-items-center mobile-no"
          href="/userdashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary fw-bold fs-4">EduLearn</span>
        </motion.a>

        {/* Right Side */}
        <div className="d-flex align-items-center gap-3 mobile-no hide-me">

          {/* Home */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link className="nav-link fw-medium" to="/">Home</Link>
          </motion.div>

          {/* Search */}
          <div className="search-bar-container">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="search-btn"
              onClick={handleSearch}
            >
              <i className="bi bi-search hide me"></i>
            </motion.button>
          </div>

          <button
            className="btn btn-outline-primary"
            onClick={handleMyCourses}
          >
            <i className="bi bi-book me-1"></i> My Courses
          </button>
          {/* Cart */}
          
          {/* <CartIcon /> */}

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline-danger"
            onClick={logout}
          >
            Logout
          </motion.button>

        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar-toggler border-0 ms-3"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>

      {/* Animated Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="mobile-menu d-lg-none p-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link className="nav-link mb-2 fw-medium" to="/">Home</Link>

          <div className="search-bar-container mb-2">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn" onClick={handleSearch}>
              <i className="bi bi-search"></i>
            </button>
          </div>

          <button
            className="btn btn-outline-primary w-100 mt-2"
            onClick={handleMyCourses}
          >
            <i className="bi bi-book me-1"></i> My Courses
          </button>
          {/* <CartIcon /> */}

          <button
            className="btn btn-outline-danger w-100 mt-2"
            onClick={logout}
          >
            Logout
          </button>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;

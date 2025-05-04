import React from 'react';
import { motion } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <motion.h5 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="fw-bold mb-4"
            >
              EduLearn
            </motion.h5>
            <p className="mb-4">
              Transforming education through technology. Our platform provides accessible, 
              high-quality learning experiences for students worldwide.
            </p>
            <div className="d-flex gap-3">
              <a href="/social/facebook" className="text-white">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="/social/twitter" className="text-white">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="/social/instagram" className="text-white">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="/social/linkedin" className="text-white">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
            <h6 className="fw-bold mb-4">Quick Links</h6>
            <ul className="list-unstyled">
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="#home" className="text-decoration-none text-white-50 hover-white">Home</a>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/about" className="text-decoration-none text-white-50 hover-white">About Us</a>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/courses" className="text-decoration-none text-white-50 hover-white">Courses</a>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/instructors" className="text-decoration-none text-white-50 hover-white">Instructors</a>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/contact" className="text-decoration-none text-white-50 hover-white">Contact</a>
              </motion.li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
            <h6 className="fw-bold mb-4">Resources</h6>
            <ul className="list-unstyled">
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/blog" className="text-decoration-none text-white-50 hover-white">Blog</a>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/help" className="text-decoration-none text-white-50 hover-white">Help Center</a>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/careers" className="text-decoration-none text-white-50 hover-white">Careers</a>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="mb-2"
              >
                <a href="/faq" className="text-decoration-none text-white-50 hover-white">FAQ</a>
              </motion.li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-4">
            <h6 className="fw-bold mb-4">Stay Updated</h6>
            <p className="mb-3">Subscribe to our newsletter for the latest updates</p>
            <div className="input-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Your email" 
                aria-label="Your email" 
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary" 
                type="button"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">
              &copy; {currentYear} EduLearn. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="/terms" className="text-decoration-none text-white-50 small">Terms of Service</a>
              </li>
              <li className="list-inline-item ms-3">
                <a href="/privacy" className="text-decoration-none text-white-50 small">Privacy Policy</a>
              </li>
              <li className="list-inline-item ms-3">
                <a href="/cookies" className="text-decoration-none text-white-50 small">Cookie Policy</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
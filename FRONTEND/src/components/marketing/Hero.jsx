import React from 'react';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';

const Hero = () => {
  return (
    <section className="hero bg-primary text-white py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="display-4 fw-bold">Learn Anytime, Anywhere</h1>
              <p className="lead">
                Expand your skills with our professional courses designed for everyone.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-light btn-lg mt-3"
              >
                Explore Courses
              </motion.button>
            </motion.div>
          </div>
          <div className="col-md-6 mt-4 mt-md-0">
            <motion.img
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
              alt="Student studying on laptop"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
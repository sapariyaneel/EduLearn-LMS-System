import { useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import React from 'react';
import Navigation from '../marketing/Navigation.jsx';
import Footer from '../marketing/Footer.jsx';
import { motion } from 'framer-motion';

const Register_user = () => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const mobileRef = useRef(null);
  const stateRef = useRef(null);
  const educationRef = useRef(null);
  const navigate = useNavigate();
  const isLanding = false;

  const register = async () => {
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post('http://localhost:9090/register', {
        "name": nameRef.current.value,
        "username": emailRef.current.value,
        "password": passwordRef.current.value,
        "mobile": mobileRef.current.value,
        "state": stateRef.current.value,
        "education": educationRef.current.value
      });

      const { data } = res;
      if (data.register === "success") {
        navigate("/login");
      } else {
        navigate("/error");
      }
    } catch (e) {
      navigate("/error");
    }
  };

  return (
    <>
      <div className={`d-flex flex-column ${isLanding ? 'landing-layout' : 'app-layout'}`}>
        <Navigation />

        <main className={isLanding ? '' : 'container py-5'}>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
            <motion.div 
              className="card p-4 shadow rounded" 
              style={{ maxWidth: '450px', width: '100%' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-4 text-center fw-bold text-primary">Create Your Account</h3>

              <input type="text" ref={nameRef} placeholder="Full Name" className="form-control mb-3" />
              <input type="email" ref={emailRef} placeholder="Email" className="form-control mb-3" />
              <input type="password" ref={passwordRef} placeholder="Password" className="form-control mb-3" />
              <input type="password" ref={confirmPasswordRef} placeholder="Confirm Password" className="form-control mb-3" />
              <input type="text" ref={mobileRef} placeholder="Mobile Number" className="form-control mb-3" />
              <input type="text" ref={stateRef} placeholder="State" className="form-control mb-3" />

              <select ref={educationRef} className="form-control mb-3">
                <option value="">Select Education</option>
                <option value="12th">12th</option>
                <option value="Graduation">Graduation</option>
                <option value="Post Graduation">Post Graduation</option>
              </select>

              <motion.button 
                onClick={register}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary w-100 mb-3"
              >
                Register
              </motion.button>

              <button className="btn btn-outline-dark w-100 mb-3">
                <i className="bi bi-google me-2"></i> Continue with Google
              </button>

              <div className="text-center">
                <small>Already have an account? <Link to="/login">Log In</Link></small>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Register_user;

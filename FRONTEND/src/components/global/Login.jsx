import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import React from 'react';
import Navigation from '../marketing/Navigation.jsx';
import Footer from '../marketing/Footer.jsx';
import { motion } from 'framer-motion';
import { authService } from '../../services/api';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isLanding = false;

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
      // Token exists, redirect based on role
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/userdashboard");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login(credentials.email, credentials.password);
      
      const { data } = response;
      
      if (data && data.login === "success" && data.token) {
        // Store auth data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("name", data.name);
        localStorage.setItem("role", data.role);
        localStorage.setItem("tokenTime", Date.now().toString());
        
        console.log("Login successful, redirecting based on role:", data.role);
        
        if (data.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (data.role === "INSTRUCTOR") {
          navigate("/instructor/dashboard");
        } else {
          navigate("/userdashboard");
        }
      } else {
        setError(data?.message || "Invalid credentials");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Login failed. Check your credentials.");
      } else if (err.request) {
        setError("Connection failed. Backend server may be unavailable.");
      } else {
        setError("An error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`d-flex flex-column ${isLanding ? 'landing-layout' : 'app-layout'}`}>
        <Navigation />

        <main className={isLanding ? '' : 'container py-5'}>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
            <motion.div 
              className="card p-4 shadow rounded" 
              style={{ maxWidth: '400px', width: '100%' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-4 text-center fw-bold text-primary">Welcome Back</h3>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={login}>
                <div className="mb-3">
                  <input 
                    type="email" 
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Email address" 
                    className="form-control" 
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <input 
                    type="password" 
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Password" 
                    className="form-control"
                    required
                  />
                </div>
                
                <motion.button 
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary w-100 mb-3"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </motion.button>
              </form>

              <div className="text-center">
                <small>Don't have an account? <Link to="/register_user">Sign Up</Link></small>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Login;

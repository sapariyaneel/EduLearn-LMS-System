import React from 'react';
import { motion } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';

const steps = [
  {
    id: 1,
    title: "Sign Up",
    description: "Create your account in seconds and get started.",
    icon: "bi bi-person-plus-fill"
  },
  {
    id: 2,
    title: "Learn",
    description: "Access high-quality course content and materials.",
    icon: "bi bi-book-fill"
  },
  {
    id: 3,
    title: "Take Quiz",
    description: "Test your knowledge with interactive assessments.",
    icon: "bi bi-pencil-square"
  },
  {
    id: 4,
    title: "Get Certified",
    description: "Earn certificates to showcase your achievements.",
    icon: "bi bi-award-fill"
  }
];

const HowItWorks = () => {
  
  // Create SVG icons based on step type
  const getIconSVG = (iconName) => {
    switch(iconName) {
      case "bi bi-person-plus-fill":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-plus-fill" viewBox="0 0 16 16">
            <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
            <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
          </svg>
        );
      case "bi bi-book-fill":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-book-fill" viewBox="0 0 16 16">
            <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
          </svg>
        );
      case "bi bi-pencil-square":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
          </svg>
        );
      case "bi bi-award-fill":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-award-fill" viewBox="0 0 16 16">
            <path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864z"/>
            <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <section className="how-it-works py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">How It Works</h2>
          <p className="lead">Follow these simple steps to start your learning journey</p>
        </div>
        
        <div className="row">
          {steps.map((step, index) => (
            <div key={step.id} className="col-md-3 mb-4 mb-md-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="position-relative mb-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px' }}>
                    {getIconSVG(step.icon)}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="process-line d-none d-md-block position-absolute top-50 start-100" style={{ height: '2px', width: 'calc(100% - 40px)', backgroundColor: '#dee2e6', transform: 'translateX(-50%)' }}></div>
                  )}
                </div>
                <h4>{step.title}</h4>
                <p className="text-muted">{step.description}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 
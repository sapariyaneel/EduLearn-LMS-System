import React from 'react';
import { motion } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';

const featuresList = [
  {
    id: 1,
    title: "Learn at Your Own Pace",
    description: "Take courses on your schedule, access materials anytime.",
    icon: "bi bi-clock",
    user: "Student"
  },
  {
    id: 2,
    title: "Get Certified",
    description: "Earn certificates recognized by industry professionals.",
    icon: "bi bi-award",
    user: "Student"
  },
  {
    id: 3,
    title: "Hands-on Projects",
    description: "Work on real-world projects to build practical skills.",
    icon: "bi bi-laptop", // ✅ This exists — keep it
    user: "Student"
  },
  {
    id: 4,
    title: "Global Community",
    description: "Join a worldwide network of learners and experts.",
    icon: "bi bi-people", // ✅ better than bi-globe for 'community'
    user: "Student"
  },
  {
    id: 5,
    title: "Expert Instructors",
    description: "Learn from top professionals with years of industry experience.",
    icon: "bi bi-person-lines-fill", // ✅ clearer for 'instructors'
    user: "Student"
  },
  {
    id: 6,
    title: "Interactive Learning",
    description: "Engage with quizzes, coding exercises, and peer discussions.",
    icon: "bi bi-chat-left-text", // ✅ good for interactive/chat/discussion
    user: "Student"
  }
  
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const Features = () => {
  // Create SVG icons based on feature type
  const getIconSVG = (iconName) => {
    switch(iconName) {
      case "bi bi-clock":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
          </svg>
        );
      case "bi bi-award":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-award" viewBox="0 0 16 16">
            <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68z"/>
            <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
          </svg>
        );
      case "bi bi-laptop":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-laptop" viewBox="0 0 16 16">
            <path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5"/>
          </svg>
        );
      case "bi bi-person-lines-fill":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-lines-fill" viewBox="0 0 16 16">
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"/>
          </svg>
        );
      case "bi bi-people":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
          </svg>
        );
      case "bi bi-bar-chart":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bar-chart" viewBox="0 0 16 16">
            <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5h-2v12h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM8 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1zm-5 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className="features py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Interactive Learning Hub</h2>
          <p className="lead">Trusted by 275+ Leading Universities and Companies</p>
        </div>
        
        <motion.div 
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featuresList.map((feature) => (
            <motion.div 
              key={feature.id} 
              className="col-md-4"
              variants={itemVariants}
            >
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                      {getIconSVG(feature.icon)}
                    </div>
                    <span className="badge bg-secondary">{feature.user}</span>
                  </div>
                  <h5 className="card-title">{feature.title}</h5>
                  <p className="card-text text-muted">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 
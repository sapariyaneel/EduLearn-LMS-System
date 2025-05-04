import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import React from "react";
import Navigation from "./Navigation.jsx";
import Footer from "../marketing/Footer.jsx";
import CourseList from "./CourseList.jsx"; // Import CourseList component

const Video_dashborad = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state || {};
  // Get token from localStorage
  const token = localStorage.getItem("token"); 

  // Check if course is available
  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Course Not Found</h2>
      </div>
    );
  }

  const isLanding = false;

  return (
    <div className={`d-flex flex-column ${isLanding ? 'landing-layout' : 'app-layout'}`}>
      
      <Navigation />

      <main className={isLanding ? '' : 'container py-5'}>
        <section className="py-5 bg-light text-dark text-center">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6 mb-4 mb-md-0">
                <h1 className="display-4 fw-bold">Video Lectures</h1>
                <p className="lead">
                  Watch lectures anytime, grow your skills, and achieve your goals with ease.
                </p>
                <a href="#courses" className="btn btn-primary btn-lg me-3">Explore Courses</a>
                <a href="#about" className="btn btn-outline-primary btn-lg">Learn More</a>
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
      </main>

      {/* Pass token as a prop to CourseList */}
      <CourseList token={token} />

      <br /><br />

      <Outlet />
      <Footer />
    </div>
  );
};

export default Video_dashborad;

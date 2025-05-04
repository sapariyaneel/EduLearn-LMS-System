import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './CourseSection.css';
import { courseService } from "../../services/api";
import axios from "axios";

const CourseSection = () => {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const fetchCourses = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Use the courseService from api.js with the corrected URL
      const response = await axios.get("http://localhost:9090/api/user/courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Process the response
      const data = response.data;
      
      // Filter only published courses if needed
      const publishedCourses = data.filter(course => 
        !course.status || course.status === 'PUBLISHED'
      );
      
      setCourses(publishedCourses);
      setError("");

      const transformedPrograms = [
        {
          title: "Top Online Courses ",
          heading: "Find a high-impact course that fits your goals",
          subHeading:
            "Master skills in Web Development, Data Science, AI & more — all 100% online.",
          card: publishedCourses.map(course => ({
            id: course.id,
            img: course.thumbnail || "https://via.placeholder.com/300x200?text=Course+Image",
            logo: course.logoUrl || "https://pamutalwar.s3.eu-north-1.amazonaws.com/courses/logo.jpg",
            instit: course.institutionName || "EduLearn Academy",
            courseName: course.title,
            degreeIcon: true,
            degree: course.degreeLabel || "Earn a certificate",
            Degree: "Course",
            Price: course.price || 0,
            Pamu: course.description,
          })),
        }
      ];

      setPrograms(transformedPrograms);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    navigate(`/coursedetail`, { 
      state: { 
        course: {
          ...course,
          // Ensure all necessary fields are passed to match CourseDetailOK expectations
          img: course.img,
          logo: course.logo,
          instit: course.instit,
          courseName: course.courseName,
          Price: course.Price,
          degree: course.degree,
          Pamu: course.Pamu || course.description
        } 
      }
    });
  };
  
  // Set up polling for real-time updates
  useEffect(() => {
    fetchCourses();
    
    // Setup polling for real-time updates
    const intervalId = setInterval(() => {
      fetchCourses(false);
    }, 60000); // Poll every minute
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && courses.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {error && (
          <div className="alert alert-danger text-center mb-4 w-100">
            {error}
          </div>
        )}

        {programs.map((prog, progIndex) => (
          <div key={progIndex} className="mb-20">
            {/* Section Heading */}
            <div className="text-center mb-10">
              <h3 className="text-blue-800 text-lg font-semibold uppercase tracking-wide">
                <span style={{color:"#007bff"}}>{prog.title}</span>
              </h3>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900">
                {prog.heading}
              </h2>
              <p className="mt-4 text-gray-800 text-lg sm:text-xl max-w-5xl mx-auto">
                {prog.subHeading}
              </p>
            </div>

            {/* Cards Layout */}
            <div className="flex flex-wrap gap-6 justify-center md:justify-start flex-container">
              {prog.card.map((card, index) => (
                <div
                  key={index}
                  onClick={() => handleCourseClick(card)}
                  className="flex flex-col basis-64 md:basis-72 bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
                >
                  <img
                    src={card.img || "https://via.placeholder.com/300x200"}
                    alt="Course"
                    className="w-full h-48 object-cover rounded-t-2xl"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=Course+Image";
                    }}
                  />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {card.logo ? (
                        <img
                          src={card.logo}
                          alt="Logo"
                          className="h-6 w-6 object-contain"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/50?text=Logo";
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold">{card.instit}</span>
                      )}
                      <p className="text-sm text-gray-500 truncate">
                        {card.instit}
                      </p>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2">
                      {card.courseName}
                    </h3>
                    {card.degreeIcon && (
                      <p className="text-blue-700 font-medium flex items-center mb-0.6">
                        🎓 {card.degree}
                      </p>
                    )}
                  
                    <p className="mt-4 text-gray-800 text-lg sm:text-xl max-w-5xl mx-auto font-bold">
                      {card.Degree} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      Price ₹ {card.Price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-8 text-center">
              <button 
                className="btn btn-primary px-4 py-2 font-semibold mb-4"
                onClick={() => navigate('/userdashboard/courses')}
              >
                <i className="bi bi-book me-2"></i> Explore All Courses
              </button>
            </div>
          </div>
        ))}

        {/* Fallback for No Data */}
        {courses.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg font-medium">
              No courses available
            </p>
            <p className="text-gray-400 mt-2">
              Please check back later or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSection;

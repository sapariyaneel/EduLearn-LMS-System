import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "./Navigation";
import CollaborationSection from "./CollaborationSection";
import InvestInCareer from "./InvestInCareer";
import Footer from "../marketing/Footer";
import "./CourseDetailOK.css";
import { useCart } from "../../CartContext";
import CartIcon from "../../CartIcon";
import { videoService, enrollmentService } from "../../services/api";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const CourseDetailOK = () => {
  const { addToCart, cart, setCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = location.state || {};
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  // Use a default Indian phone number - no prompt needed
  const phoneNumber = "9999999999";
  // console.log("Using token:", localStorage.getItem("token"));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });

        const { data } = res;
        setCourses(data);

          const transformedPrograms = [
            {
              title: "Top Online Courses",
              heading: "Find a high-impact course that fits your goals",
              subHeading: "Master skills in Web Development, Data Science, AI & more — all 100% online.",
              card: data.map((course) => ({
                id: course.id,
                img: course.imageUrl,
                logo: course.logoUrl || "https://pamutalwar.s3.eu-north-1.amazonaws.com/courses/logo.jpg",
                instit: course.institutionName,
                courseName: course.courseName,
                Pamu: course.description,
                degree: course.degreeLabel || "Earn a certificate",
                Degree: "Course",
                Price: course.price,
              })),
          },
        ];

        setPrograms(transformedPrograms);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (course?.id) {
      fetchCourseData();
      checkEnrollmentStatus();
    }
  }, [course?.id]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // Fetch videos for this course
      const response = await videoService.getVideosByCourseId(course.id);
      setVideos(response.data || []);
    } catch (err) {
      console.error("Error fetching course videos:", err);
      setError("Could not load course videos.");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await enrollmentService.getAllEnrollments();
      const userEnrollments = response.data.filter(
        e => {
          const enrollmentUserId = e.userId || (e.user && e.user.id);
          const enrollmentCourseId = e.courseId || (e.course && e.course.id);
          
          return enrollmentUserId?.toString() === userId?.toString() && 
                 enrollmentCourseId?.toString() === course?.id?.toString();
        }
      );
      
      setIsEnrolled(userEnrollments.length > 0);
      if (userEnrollments.length > 0) {
        setEnrollment(userEnrollments[0]);
      }
    } catch (err) {
      console.error("Error checking enrollment status:", err);
    }
  };

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Only remove the script if it's still in the document
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleBack = () => {
    navigate("/userdashboard/courses");
  };
  
  const handleAddToCart = () => {
    addToCart(course);
  };

  const handleEnrollNow = async () => {
    // Just start payment directly with default phone number
    handlePayment(phoneNumber);
  };

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Course Not Found</h2>
      </div>
    );
  }
  // console.log("Using token:", localStorage.getItem("token"));
  const totalCost = course?.Price || 500;

  const handlePayment = async (userPhone = phoneNumber) => {
    try {
      console.log("Starting payment process for course:", course);
      
      // Create order - This endpoint should match ExcelRController
      const orderResponse = await axios.post(`${API_BASE_URL}/api/create-order`, {
        amount: course.Price,
        currency: "INR",
        receipt: `course_${course.id}_${Date.now()}`
      });
      
      console.log("Order created successfully:", orderResponse.data);

      const orderData = typeof orderResponse.data === 'string' 
        ? JSON.parse(orderResponse.data) 
        : orderResponse.data;

      console.log("Parsed order data:", orderData);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "EduLearn Academy",
        description: `Enrollment for ${course.courseName}`,
        order_id: orderData.id,
        handler: async function(response) {
          console.log("Payment response:", response);
          
          try {
            // Verify payment
            const verifyResponse = await axios.post(`${API_BASE_URL}/api/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            console.log("Verification response:", verifyResponse);

            if (verifyResponse.status === 200) {
              // Payment verified successfully, now create enrollment
              try {
                const userId = localStorage.getItem('userId');
                
                // Ensure userId and courseId are numbers
                const userIdNum = parseInt(userId);
                const courseIdNum = parseInt(course.id);
                
                console.log("Creating enrollment with userId:", userIdNum, "courseId:", courseIdNum);
                
                const enrollResponse = await axios.post(`${API_BASE_URL}/api/enrollments`, {
                  userId: userIdNum,
                  courseId: courseIdNum,
                  status: "ENROLLED",
                  enrollmentDate: new Date().toISOString().split('T')[0],
                  paymentId: response.razorpay_payment_id
                }, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                console.log("Enrollment created:", enrollResponse.data);
                alert("Payment Successful! You are now enrolled in the course.");
                navigate("/userdashboard/my-enrollments");
              } catch (enrollError) {
                console.error("Error creating enrollment:", enrollError);
                console.error("Error details:", enrollError.response?.data);
                
                // Even if enrollment creation fails, display success message
                // and redirect the user - this will be fixed by support
                alert("Payment successful! You will be enrolled in the course shortly.");
                navigate("/userdashboard/my-enrollments");
              }
            } else {
              alert("Payment Verification Failed!");
            }
          } catch (verifyError) {
            console.error("Error verifying payment:", verifyError);
            alert("Error verifying payment. Please contact support.");
          }
        },
        prefill: {
          name: localStorage.getItem('name') || "EduLearn Student",
          email: localStorage.getItem('email') || "",
          contact: userPhone // Use the validated phone number
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function() {
            console.log('Payment dismissed');
          }
        }
      };

      // Make sure Razorpay is loaded
      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      // Initialize Razorpay
      console.log("Initializing Razorpay with options:", options);
      const razorpayInstance = new window.Razorpay(options);
      
      // Handle payment failures
      razorpayInstance.on('payment.failed', function(response) {
        console.error("Payment failed:", response.error);
        if (response.error.description.includes("phone") || 
            response.error.description.includes("international") || 
            response.error.description.includes("number")) {
          alert("Payment failed: This merchant only accepts Indian phone numbers. Please use an Indian phone number (10 digits starting with 6-9).");
        } else {
          alert(`Payment failed: ${response.error.description}`);
        }
      });
      
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment Failed:", error);
      alert(`Payment processing failed: ${error.message || "Unknown error"}. Please try again later.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side - Image */}
          <div className="lg:w-1/2 flex items-center justify-center p-4">
            <img
              src={course.img || "https://via.placeholder.com/800x600"}
              alt="Course Banner"
              className="rounded-2xl object-cover max-h-[500px] w-full"
              style={{ paddingLeft: "41px" }}
            />
          </div>

          {/* Right Side - Content */}
          <div
            className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between"
            style={{ paddingLeft: "66px", paddingRight: "20px" }}
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                {course.logo && (
                  <img
                    src={course.logo || "https://pamutalwar.s3.eu-north-1.amazonaws.com/courses/logo.jpg"}
                    alt="Institution Logo"
                    className="h-16 w-16 rounded-full border object-contain"
                    onError={(e) => {
                      e.target.src = "https://pamutalwar.s3.eu-north-1.amazonaws.com/courses/logo.jpg";
                    }}
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-blue-700">{course.instit}</h3>
                  <p className="text-sm text-gray-500">{course.degree}</p>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                🎓 {course.courseName}
              </h1>

              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                Learn everything about <strong>{course.courseName}</strong>. Get certified by{" "}
                <strong>{course.instit}</strong> and boost your career with professional skills.
              </p>

              <p className="text-gray-600 text-md mb-6">{course.Pamu || "Description not available"}</p>

              <p className="text-2xl font-bold text-green-600 mb-6">Price ₹{course.Price}</p>
              
              {/* Course Content Preview */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold mb-3">Course Content</h4>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : videos.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">{videos.length} videos • Approximately {Math.round(videos.length * 10 / 60)} hours</p>
                    <ul className="space-y-2 mb-3">
                      {videos.slice(0, 3).map((video, index) => (
                        <li key={video.id} className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{video.title}</p>
                            <p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 5} min</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {videos.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{videos.length - 3} more videos
                      </p>
                    )}
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <p className="text-sm text-gray-500">No videos available for this course yet.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 d-flex">
              <br />
              <br />
              {isEnrolled ? (
                <button 
                  onClick={() => navigate(`/course-player/${course.id}`, { state: { course } })} 
                  className="button-22 bg-blue-700 hover:bg-blue-800"
                >
                  <i className="bi bi-play-circle-fill mr-2"></i> Continue Learning
                </button>
              ) : (
                <>
                  <button onClick={handleBack} className="button-22">
                    Show more
                  </button>
                  <button onClick={handleEnrollNow} className="button-22">
                    🚀 Enroll Now
                  </button>
                </>
              )}
            </div>
            <br />

            <div className="mt-6">
              <button 
                onClick={handleBack} 
                className="btn btn-outline-primary py-2 px-4 d-flex align-items-center"
              >
                <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
              </button>
              <br />
              <br />
            </div>
          </div>
        </div>
        
        {/* Enrolled Info - Only shown for enrolled users */}
        {isEnrolled && enrollment && (
          <div className="mt-8 bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Course Completion</span>
                <span className="text-sm font-medium">{enrollment.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${enrollment.progress || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-2">Course Content</h3>
              
              {videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.slice(0, 5).map((video, index) => (
                    <div key={video.id} className="flex items-start border-b border-gray-200 pb-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        {index + 1}
                      </span>
                      <div className="flex-grow">
                        <p className="font-medium">{video.title}</p>
                        <p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 5} min</p>
                      </div>
                      {enrollment.completedVideos && enrollment.completedVideos.includes(video.id.toString()) ? (
                        <span className="text-green-500 flex-shrink-0">
                          <i className="bi bi-check-circle-fill"></i>
                        </span>
                      ) : (
                        <span className="text-gray-400 flex-shrink-0">
                          <i className="bi bi-play-circle"></i>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No videos available yet for this course.</p>
              )}
              
              {videos.length > 5 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => navigate(`/course-player/${course.id}`, { state: { course } })}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All {videos.length} Videos
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => navigate(`/course-player/${course.id}`, { state: { course } })}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailOK;

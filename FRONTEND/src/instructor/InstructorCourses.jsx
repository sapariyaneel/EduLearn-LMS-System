import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService, videoService, categoryService } from '../services/api';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseStats, setCourseStats] = useState({});
  const [categories, setCategories] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const instructorId = localStorage.getItem('userId');
      
      // Fetch categories first to map them to courses
      const categoriesResponse = await categoryService.getAllCategories();
      const categoryMap = categoriesResponse.data.reduce((acc, category) => {
        acc[category.id] = category.name || `Category ${category.id}`;
        return acc;
      }, {});
      setCategories(categoryMap);
      
      // Use the dedicated method to get instructor courses
      const coursesResponse = await courseService.getCoursesByInstructor(instructorId);
      setCourses(coursesResponse.data);
      
      // Fetch video stats for each course
      const statsPromises = coursesResponse.data.map(async (course) => {
        try {
          const videosResponse = await videoService.getVideosByCourseId(course.id);
          return {
            courseId: course.id,
            videoCount: videosResponse.data?.length || 0
          };
        } catch (err) {
          console.error(`Error fetching videos for course ${course.id}:`, err);
          return {
            courseId: course.id,
            videoCount: 0
          };
        }
      });
      
      const stats = await Promise.all(statsPromises);
      
      // Convert array to object with courseId as key
      const statsObject = stats.reduce((acc, curr) => {
        acc[curr.courseId] = curr.videoCount;
        return acc;
      }, {});
      
      setCourseStats(statsObject);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load course data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get category name based on categoryId
  const getCategoryName = (categoryId) => {
    return categories[categoryId] || 'Uncategorized';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">My Courses</h1>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {courses.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-book fs-1 text-muted mb-3"></i>
            <h3>No Courses Assigned</h3>
            <p className="text-muted mb-0">You don't have any courses assigned to you yet.</p>
            <p>Once an admin assigns courses to you, they will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {courses.map(course => (
            <motion.div 
              key={course.id} 
              className="col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card h-100 shadow-sm">
                <div className="position-relative">
                  <img 
                    src={course.thumbnail || 'https://via.placeholder.com/300x150?text=Course+Image'} 
                    className="card-img-top" 
                    alt={course.title}
                    style={{ height: '160px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x150?text=Course+Image';
                    }}
                  />
                  <div className="position-absolute top-0 end-0 p-2">
                    <span className="badge bg-primary rounded-pill">
                      {courseStats[course.id] || 0} videos
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text text-muted small">
                    {course.description?.length > 100 
                      ? `${course.description.substring(0, 100)}...` 
                      : course.description || 'No description available'}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-light text-dark">
                      <i className="bi bi-mortarboard me-1"></i>
                      {getCategoryName(course.categoryId)}
                    </span>
                    <Link 
                      to={`/instructor/videos?course=${course.id}`} 
                      className="btn btn-sm btn-primary"
                    >
                      <i className="bi bi-film me-1"></i>
                      Manage Videos
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
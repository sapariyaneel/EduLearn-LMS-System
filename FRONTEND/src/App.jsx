import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './admin/Dashboard'
import CoursesManagement from './admin/CoursesManagement'
import Users from './admin/Users'
import Notifications from './admin/Notifications'
import Certificates from './admin/Certificates'
import Settings from './admin/Settings'
import Reports from './admin/Reports'
import Enrollments from './admin/Enrollments'
import VideoManagement from './admin/VideoManagement'
import Login from './components/global/Login'

// Import the landing page components
import MainLayout from './components/marketing/MainLayout'
import LandingPage from './components/marketing/LandingPage'

// Import other existing components
import Register_user from './components/global/Register_user'
import UserDashboard from './components/user/UserDashboard'
import Laptops from './components/user/Laptops'
import Mobiles from './components/user/Mobiles'
import Headphones from './components/user/Headphones'
import LaptopDetails from './components/user/LaptopDetails'
import MobilesDetails from './components/user/MobileDetails'
import HeadphoneDetails from './components/user/HeadphoneDetails'
import EnrollCourses from './components/user/EnrollCourses'
import MyEnrollments from './components/user/MyEnrollments'
import CartInvoice from './CartInvoice'
import CourseSection from './components/user/CourseSection'
import CourseDetail from './components/user/CourseDetail'
import CoursePlayer from './components/user/CoursePlayer'
import Certificate from './components/user/Certificate'

// Import Instructor components
import InstructorLayout from './layouts/InstructorLayout'
import InstructorDashboard from './instructor/InstructorDashboard'
import InstructorVideoManagement from './instructor/InstructorVideoManagement'
import InstructorCourses from './instructor/InstructorCourses'

import { CartProvider } from './CartContext'
import { isTokenExpired } from './services/api'
import { useEffect } from 'react'

// Auth check functions
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // We rely on the tokenTime-based check for performance
  // API validation is done in Login component and interceptors
  const tokenTime = localStorage.getItem('tokenTime');
  if (tokenTime) {
    const currentTime = Date.now();
    const tokenAge = currentTime - parseInt(tokenTime);
    
    // Use a more conservative 12 hour timeout instead of 55 minutes
    if (tokenAge > 12 * 60 * 60 * 1000) {
      console.log('Token considered expired by age:', tokenAge / (60 * 60 * 1000), 'hours');
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      localStorage.removeItem('tokenTime');
      return false;
    }
  } else {
    // If we have a token but no tokenTime, set it now
    localStorage.setItem('tokenTime', Date.now().toString());
  }
  
  return true;
};

const hasAdminRole = () => localStorage.getItem('role') === 'ADMIN';
const hasInstructorRole = () => localStorage.getItem('role') === 'INSTRUCTOR';

// Protected route component for admin
const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAdminRole()) {
    // Redirect non-admin users to user dashboard
    return <Navigate to="/userdashboard" replace />;
  }
  
  return children;
};

// Protected route component for instructors
const InstructorRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasInstructorRole()) {
    // Redirect non-instructor users to appropriate dashboard
    if (hasAdminRole()) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/userdashboard" replace />;
    }
  }
  
  return children;
};

// Protected route component for any authenticated user
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  // Check token validity on app load
  useEffect(() => {
    if (localStorage.getItem('token') && isTokenExpired()) {
      // Clear auth data if token is expired
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      localStorage.removeItem('tokenTime');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={
            <MainLayout isLanding={true}>
              <LandingPage />
            </MainLayout>
          } />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register_user" element={<Register_user />} />
          
          {/* User Dashboard Routes - Protected */}
          <Route path="/userdashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<CourseSection />} />
            <Route path="courses" element={<EnrollCourses />} />
            <Route path="my-enrollments" element={<MyEnrollments />} />
          </Route>
          
          {/* Product Details */}
          <Route path="/laptopdetails" element={<LaptopDetails />} />
          <Route path="/mobiledetails" element={<MobilesDetails />} />
          <Route path="/headphonedetails" element={<HeadphoneDetails />} />
          <Route path="/coursedetail" element={<CourseDetail />} />
          <Route path="/course-player/:courseId" element={<CoursePlayer />} />
          <Route path="/certificate/:courseId" element={<Certificate />} />
          <Route path="/cart" element={<CartInvoice />} />
          
          {/* Admin Panel Routes - Protected */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="videos" element={<VideoManagement />} />
            <Route path="enrollments" element={<Enrollments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Instructor Panel Routes - Protected */}
          <Route path="/instructor" element={
            <InstructorRoute>
              <InstructorLayout />
            </InstructorRoute>
          }>
            <Route index element={<InstructorDashboard />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="videos" element={<InstructorVideoManagement />} />
            <Route path="courses" element={<InstructorCourses />} />
          </Route>
          
          {/* Handle 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App

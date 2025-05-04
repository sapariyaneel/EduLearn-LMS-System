import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const { course, userName } = location.state || {};
  const [currentDate, setCurrentDate] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Format current date
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    
    // Generate certificate ID
    const randomId = Math.floor(10000 + Math.random() * 90000);
    setCertificateId(`EDLRN-${date.getFullYear()}-${randomId}`);
    
    // If no course data, redirect back
    if (!course) {
      navigate('/userdashboard/my-enrollments');
    }
  }, [course, navigate]);
  
  const handleDownloadPDF = () => {
    setLoading(true);
    const certificateElement = document.getElementById('certificate');
    
    html2canvas(certificateElement, {
      scale: 2,
      useCORS: true,
      logging: false
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificate-${course.courseName.replace(/\s+/g, '-')}.pdf`);
      setLoading(false);
    });
  };
  
  const handleBackToCourse = () => {
    navigate(`/course-player/${courseId}`, { state: { course } });
  };
  
  const handleBackToEnrollments = () => {
    navigate('/userdashboard/my-enrollments');
  };
  
  if (!course) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading certificate...</p>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h2 className="mb-3">Course Completion Certificate</h2>
        <p>Congratulations on completing the course!</p>
        <div className="d-flex justify-content-center gap-3 mb-4">
          <button 
            className="btn btn-primary" 
            onClick={handleDownloadPDF}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating PDF...
              </>
            ) : (
              <>
                <i className="bi bi-download me-2"></i>
                Download Certificate
              </>
            )}
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={handleBackToCourse}
          >
            <i className="bi bi-play-circle me-2"></i>
            Review Course
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={handleBackToEnrollments}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to My Enrollments
          </button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto"
        style={{ maxWidth: '1000px' }}
      >
        {/* Certificate Design */}
        <div 
          id="certificate" 
          className="border border-2 border-dark p-5 bg-white shadow-lg position-relative"
          style={{ 
            aspectRatio: '16/9',
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(249,252,255,1) 100%)',
            fontFamily: 'Georgia, serif'
          }}
        >
          {/* Certificate Header - Date and ID */}
          <div className="d-flex justify-content-between mb-5">
            <div className="text-start">
              <p className="mb-0 fw-bold">Date Issued:</p>
              <p className="mb-0">{currentDate}</p>
            </div>
            <div className="text-end">
              <p className="mb-0 fw-bold">Certificate Number:</p>
              <p className="mb-0">{certificateId}</p>
            </div>
          </div>

          {/* Certificate Logo/Heading */}
          <div className="text-center mb-5">
            <img 
              src="/images/edulearn-logo.png" 
              alt="EduLearn Academy" 
              className="img-fluid mb-3"
              style={{ height: '80px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="mb-2" style={{ fontFamily: 'Cambria, serif', fontSize: '42px', color: '#10375c', fontWeight: 'bold' }}>
              Certificate of Completion
            </h1>
            <div className="d-flex justify-content-center align-items-center">
              <div className="border-top border-dark w-25 mx-3" style={{ height: '1px', opacity: 0.5 }}></div>
              <div className="text-muted">EduLearn Academy</div>
              <div className="border-top border-dark w-25 mx-3" style={{ height: '1px', opacity: 0.5 }}></div>
            </div>
          </div>
          
          {/* Certificate Content */}
          <div className="text-center mb-5">
            <p className="mb-3" style={{ fontSize: '18px' }}>This is to certify that</p>
            <h2 className="mb-3" style={{ fontFamily: 'Britannic Bold, serif', fontSize: '38px', color: '#1a5276', letterSpacing: '1px' }}>
              {localStorage.getItem('name') || userName || 'Student Name'}
            </h2>
            <p className="mb-3" style={{ fontSize: '18px' }}>has successfully completed the course</p>
            <h3 className="mb-4" style={{ fontFamily: 'Cambria, serif', fontSize: '32px', color: '#2c3e50', letterSpacing: '0.5px' }}>
              {course.courseName}
            </h3>
            <p className="mb-0" style={{ fontSize: '18px' }}>with excellence and commitment to professional development</p>
          </div>
          
          {/* Certificate Footer - Signature and Seal */}
          <div className="row mt-5 pt-4">
            <div className="col-5 text-start">
              <img 
                src="/images/signature.png" 
                alt="Signature" 
                className="img-fluid mb-2" 
                style={{ height: '70px', objectFit: 'contain' }}
              />
              <div className="border-top border-dark" style={{ width: '70%', opacity: 0.7 }}></div>
              <p className="mt-1 mb-0 fw-bold">Neel Sapariya</p>
              <p className="mb-0">Director</p>
            </div>
            <div className="col-2">
              {/* Spacer column */}
            </div>
            <div className="col-5 text-end">
              <img 
                src="/images/seal.png" 
                alt="Official Seal" 
                className="img-fluid mb-2" 
                style={{ height: '120px', objectFit: 'contain' }}
              />
              {/* <div className="border-top border-dark ms-auto" style={{ width: '80%', opacity: 0.7 }}></div> */}
              {/* <p className="mt-1 mb-0">Official Seal</p> */}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Certificate; 
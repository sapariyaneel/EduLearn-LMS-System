import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Certificates = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [revocationReason, setRevocationReason] = useState('');
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);
  const [isRevocationModalOpen, setIsRevocationModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Sample certificates data
  const certificatesData = [
    { 
      id: 'CERT-2023-1001', 
      studentName: 'John Smith',
      studentEmail: 'john.smith@example.com',
      courseTitle: 'Advanced Machine Learning',
      issueDate: '2023-10-15',
      status: 'active',
      grade: 'A',
      completionDate: '2023-10-10',
      instructorName: 'Dr. Sarah Johnson'
    },
    { 
      id: 'CERT-2023-1002', 
      studentName: 'Emily Rodriguez',
      studentEmail: 'emily.rodriguez@example.com',
      courseTitle: 'Web Development Masterclass',
      issueDate: '2023-10-12',
      status: 'active',
      grade: 'B+',
      completionDate: '2023-10-08',
      instructorName: 'Michael Chen'
    },
    { 
      id: 'CERT-2023-1003', 
      studentName: 'David Kim',
      studentEmail: 'david.kim@example.com',
      courseTitle: 'UI/UX Design Principles',
      issueDate: '2023-10-05',
      status: 'revoked',
      grade: 'B',
      completionDate: '2023-09-30',
      instructorName: 'Jennifer Lee',
      revocationReason: 'Academic misconduct',
      revocationDate: '2023-10-18'
    },
    { 
      id: 'CERT-2023-1004', 
      studentName: 'Lisa Wang',
      studentEmail: 'lisa.wang@example.com',
      courseTitle: 'Digital Marketing Strategies',
      issueDate: '2023-09-28',
      status: 'active',
      grade: 'A-',
      completionDate: '2023-09-25',
      instructorName: 'Robert Johnson'
    },
    { 
      id: 'CERT-2023-1005', 
      studentName: 'James Taylor',
      studentEmail: 'james.taylor@example.com',
      courseTitle: 'Cloud Computing with AWS',
      issueDate: '2023-09-20',
      status: 'revoked',
      grade: 'C+',
      completionDate: '2023-09-15',
      instructorName: 'Jennifer Lee',
      revocationReason: 'Certificate issued in error',
      revocationDate: '2023-09-22'
    },
    { 
      id: 'CERT-2023-1006', 
      studentName: 'Sophia Martinez',
      studentEmail: 'sophia.martinez@example.com',
      courseTitle: 'Data Science Fundamentals',
      issueDate: '2023-09-18',
      status: 'active',
      grade: 'A+',
      completionDate: '2023-09-15',
      instructorName: 'Dr. Sarah Johnson'
    },
  ];

  // Filter certificates based on current filter and search term
  const filteredCertificates = certificatesData.filter(certificate => {
    const matchesFilter = filter === 'all' || certificate.status === filter;
    const matchesSearch = certificate.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats for the overview cards
  const stats = [
    { title: 'Total Certificates', value: certificatesData.length, icon: 'bi-award-fill', color: 'primary' },
    { title: 'Active Certificates', value: certificatesData.filter(c => c.status === 'active').length, icon: 'bi-check-circle-fill', color: 'success' },
    { title: 'Revoked Certificates', value: certificatesData.filter(c => c.status === 'revoked').length, icon: 'bi-x-circle-fill', color: 'danger' },
    { title: 'Issued This Month', value: certificatesData.filter(c => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const certificateDate = new Date(c.issueDate);
      return certificateDate.getMonth() === currentMonth && certificateDate.getFullYear() === currentYear;
    }).length, icon: 'bi-calendar3', color: 'info' },
  ];

  // Handle opening the revocation modal
  const handleOpenRevocationModal = (certificateId) => {
    setSelectedCertificateId(certificateId);
    setIsRevocationModalOpen(true);
  };

  // Handle revoking a certificate
  const handleRevokeCertificate = () => {
    // In a real app, this would make an API call to revoke the certificate
    
    // Update the certificates list
    const updatedCertificates = certificatesData.map(cert => 
      cert.id === selectedCertificateId 
        ? { ...cert, status: 'revoked', revocationReason } 
        : cert
    );
    
    // Close modal and reset state
    setIsRevocationModalOpen(false);
    setRevocationReason('');
    setSelectedCertificateId(null);
    
    // Show success message
    setSuccessMessage('Certificate revoked successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle viewing a certificate
  const handleViewCertificate = (certificateId) => {
    // Find the certificate to view
    const certificate = certificatesData.find(cert => cert.id === certificateId);
    
    if (certificate) {
      setSelectedCertificateId(certificate.id);
    }
  };

  return (
    <div className="certificates-management">
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {stats.map((stat, index) => (
          <div className="col-md-6 col-xl-3" key={index}>
            <motion.div 
              className={`card border-0 shadow-sm h-100`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-body d-flex align-items-center">
                <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded me-3`}>
                  <i className={`bi ${stat.icon} fs-4 text-${stat.color}`}></i>
                </div>
                <div>
                  <h6 className="fw-normal text-muted mb-0">{stat.title}</h6>
                  <h4 className="fw-bold mb-0">{stat.value}</h4>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div 
        className="card border-0 shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All Certificates
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'revoked' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('revoked')}
                >
                  Revoked
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <i className="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control bg-light border-0" 
                  placeholder="Search by student, course or certificate ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Certificate Revocation Modal (Simplified in-page version) */}
      {isRevocationModalOpen && (
        <motion.div 
          className="card border-0 shadow-sm mb-4 border-danger border-start border-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Revoke Certificate
            </h5>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsRevocationModalOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="card-body">
            <p className="mb-3">You are about to revoke certificate <strong>{selectedCertificateId}</strong>. This action cannot be undone.</p>
            <div className="mb-3">
              <label className="form-label">Reason for Revocation <span className="text-danger">*</span></label>
              <select 
                className="form-select mb-2"
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                required
              >
                <option value="">Select a reason...</option>
                <option value="Academic misconduct">Academic misconduct</option>
                <option value="Certificate issued in error">Certificate issued in error</option>
                <option value="Course requirements not met">Course requirements not met</option>
                <option value="Student identity verification issue">Student identity verification issue</option>
                <option value="Other">Other</option>
              </select>
              {revocationReason === 'Other' && (
                <textarea 
                  className="form-control mt-2" 
                  rows="2" 
                  placeholder="Please specify the reason..."
                ></textarea>
              )}
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setIsRevocationModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleRevokeCertificate}
                disabled={!revocationReason}
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Certificates List */}
      <motion.div 
        className="card border-0 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">Certificate Logs</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th scope="col">Certificate ID</th>
                <th scope="col">Student</th>
                <th scope="col">Course</th>
                <th scope="col">Issue Date</th>
                <th scope="col">Grade</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map(certificate => (
                <tr key={certificate.id}>
                  <td>
                    <span className="badge bg-light text-dark font-monospace">
                      {certificate.id}
                    </span>
                  </td>
                  <td>
                    <div>
                      <h6 className="mb-0">{certificate.studentName}</h6>
                      <small className="text-muted">{certificate.studentEmail}</small>
                    </div>
                  </td>
                  <td>{certificate.courseTitle}</td>
                  <td>{certificate.issueDate}</td>
                  <td>
                    <span className="badge bg-success">{certificate.grade}</span>
                  </td>
                  <td>
                    {certificate.status === 'active' ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <div>
                        <span className="badge bg-danger mb-1">Revoked</span>
                        <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                          {certificate.revocationReason}
                        </small>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewCertificate(certificate.id)}
                        title="View Certificate"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" title="Download Certificate">
                        <i className="bi bi-download"></i>
                      </button>
                      {certificate.status === 'active' && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleOpenRevocationModal(certificate.id)}
                          title="Revoke Certificate"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCertificates.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-award fs-1 text-muted mb-2"></i>
                      <h5 className="mb-1">No certificates found</h5>
                      <p className="text-muted">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white py-3">
          <nav aria-label="Certificate pagination">
            <ul className="pagination justify-content-center mb-0">
              <li className="page-item disabled">
                <a className="page-link" href="#" tabIndex="-1">Previous</a>
              </li>
              <li className="page-item active"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">3</a></li>
              <li className="page-item">
                <a className="page-link" href="#">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </motion.div>
    </div>
  );
};

export default Certificates; 
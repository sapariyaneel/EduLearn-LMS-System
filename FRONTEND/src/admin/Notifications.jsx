import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationText, setNotificationText] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Sample notifications data
  const notificationsData = [
    { 
      id: 1, 
      title: 'New Course Added: Advanced Machine Learning', 
      message: 'A new course has been added to the Data Science category.',
      sentTo: 'all',
      sentBy: 'System',
      type: 'announcement',
      date: '2023-10-22 09:15',
      status: 'active',
    },
    { 
      id: 2, 
      title: 'System Maintenance', 
      message: 'The platform will be down for maintenance on Saturday, October 28th from 2AM to 4AM EST.',
      sentTo: 'all',
      sentBy: 'Admin',
      type: 'system',
      date: '2023-10-21 14:30',
      status: 'active',
    },
    { 
      id: 3, 
      title: 'Your Course Has Been Approved', 
      message: 'Congratulations! Your course "Web Development Masterclass" has been approved and is now live.',
      sentTo: 'instructors',
      sentBy: 'Admin',
      type: 'approval',
      date: '2023-10-20 10:45',
      status: 'active',
    },
    { 
      id: 4, 
      title: 'Complete Your Profile', 
      message: 'Please complete your profile to get personalized course recommendations.',
      sentTo: 'students',
      sentBy: 'System',
      type: 'alert',
      date: '2023-10-19 08:00',
      status: 'expired',
    },
    { 
      id: 5, 
      title: 'New Features Available', 
      message: 'Check out our new interactive quiz feature available for all courses.',
      sentTo: 'all',
      sentBy: 'Admin',
      type: 'announcement',
      date: '2023-10-18 11:20',
      status: 'active',
    },
    { 
      id: 6, 
      title: 'Course Submission Guidelines Updated', 
      message: 'We have updated our course submission guidelines. Please review before submitting new courses.',
      sentTo: 'instructors',
      sentBy: 'Admin',
      type: 'system',
      date: '2023-10-15 16:10',
      status: 'active',
    },
  ];

  // Filter notifications based on current filter and search term
  const filteredNotifications = notificationsData.filter(notification => {
    const matchesFilter = filter === 'all' || 
                          notification.type === filter || 
                          notification.sentTo === filter || 
                          notification.status === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats for the overview cards
  const stats = [
    { title: 'Total Notifications', value: notificationsData.length, icon: 'bi-bell-fill', color: 'primary' },
    { title: 'System Alerts', value: notificationsData.filter(n => n.type === 'system').length, icon: 'bi-exclamation-triangle-fill', color: 'warning' },
    { title: 'Announcements', value: notificationsData.filter(n => n.type === 'announcement').length, icon: 'bi-megaphone-fill', color: 'success' },
    { title: 'Approval Notices', value: notificationsData.filter(n => n.type === 'approval').length, icon: 'bi-check-circle-fill', color: 'info' },
  ];

  // Handle changing notification status
  const handleStatusChange = (notificationId, newStatus) => {
    // Update notification status in state
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: newStatus } 
          : notification
      )
    );
  };

  // Handle deleting a notification
  const handleDeleteNotification = (notificationId) => {
    // Remove notification from state
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  // Handle sending a new notification
  const handleSendNotification = () => {
    if (!notificationText.trim()) {
      setError('Notification text cannot be empty');
      return;
    }
    
    // Add new notification to the list
    setNotifications(prevNotifications => [
      {
        id: Date.now(),
        text: notificationText,
        recipients: selectedRecipients,
        date: new Date().toISOString(),
        status: 'Sent'
      },
      ...prevNotifications
    ]);
    
    // Reset form
    setNotificationText('');
    setSelectedRecipients('all');
    setError('');
    setSuccess('Notification sent successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // Notification type badge color
  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'system':
        return 'bg-warning';
      case 'announcement':
        return 'bg-success';
      case 'approval':
        return 'bg-info';
      case 'alert':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="notifications-management">
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

      {/* Create New Notification */}
      <motion.div 
        className="card border-0 shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">Send New Notification</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSendNotification}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Notification Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter notification title" 
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Send To</label>
                <select 
                  className="form-select"
                  value={selectedRecipients}
                  onChange={(e) => setSelectedRecipients(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="instructors">Instructors Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label">Notification Message</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Enter your message here..."
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label">Notification Type</label>
                <select className="form-select">
                  <option value="announcement">Announcement</option>
                  <option value="system">System Alert</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Expiration (Optional)</label>
                <input type="date" className="form-control" />
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-send me-2"></i>
                  Send Notification
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        className="card border-0 shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8 mb-3 mb-md-0">
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'system' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('system')}
                >
                  System
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'announcement' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('announcement')}
                >
                  Announcements
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'approval' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('approval')}
                >
                  Approvals
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
                  className={`btn ${filter === 'expired' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('expired')}
                >
                  Expired
                </button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <i className="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control bg-light border-0" 
                  placeholder="Search notifications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div 
        className="card border-0 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">Notification Management</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th scope="col" style={{ minWidth: '250px' }}>Notification</th>
                <th scope="col">Type</th>
                <th scope="col">Sent To</th>
                <th scope="col">Sent By</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map(notification => (
                <tr key={notification.id}>
                  <td>
                    <div>
                      <h6 className="mb-1">{notification.title}</h6>
                      <p className="text-muted small mb-0">{notification.message}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getTypeBadgeColor(notification.type)}`}>
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className="text-capitalize">{notification.sentTo}</span>
                  </td>
                  <td>{notification.sentBy}</td>
                  <td>{notification.date}</td>
                  <td>
                    <span className={`badge ${notification.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-eye"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-pencil"></i>
                      </button>
                      {notification.status === 'active' ? (
                        <button 
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleStatusChange(notification.id, 'expired')}
                          title="Expire Notification"
                        >
                          <i className="bi bi-clock-history"></i>
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleStatusChange(notification.id, 'active')}
                          title="Reactivate Notification"
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteNotification(notification.id)}
                        title="Delete Notification"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredNotifications.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-bell-slash fs-1 text-muted mb-2"></i>
                      <h5 className="mb-1">No notifications found</h5>
                      <p className="text-muted">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white py-3">
          <nav aria-label="Notification pagination">
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

export default Notifications; 
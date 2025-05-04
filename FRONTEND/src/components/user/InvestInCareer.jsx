import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './InvestInCareer.css'; // custom styles (optional)

const InvestInCareer = () => {
  return (
    <section className="bg-light py-5">
      <div className="container text-center">

        <h2 className="fw-bold mb-4">Invest in your career</h2>

        <div className="row gy-4">
          {/* Explore new skills */}
          <div className="col-md-4">
            <i className="bi bi-bullseye fs-1 mb-3"></i>
            <h5 className="fw-bold">Explore new skills</h5>
            <p>Access 10,000+ courses in AI, business, technology, and more.</p>
          </div>

          {/* Earn valuable credentials */}
          <div className="col-md-4">
            <i className="bi bi-patch-check fs-1 mb-3"></i>
            <h5 className="fw-bold">Earn valuable credentials</h5>
            <p>Get certificates for every course you finish and boost your chances of getting hired after your trial ends at no additional cost.</p>
          </div>

          {/* Learn from the best */}
          <div className="col-md-4">
            <i className="bi bi-star fs-1 mb-3"></i>
            <h5 className="fw-bold">Learn from the best</h5>
            <p>Take your skills to the next level with expert-led courses and Coursera Coach, your AI-powered guide.</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default InvestInCareer;

import React from 'react';
import './CollaborationSection.css';

const CollaborationSection = () => {
  return (
    <section className="collaboration-section">
      <div className="collaboration-text">
        Learn from <span className="highlight">350+ top universities and companies</span>
      </div>
      <div className="collaboration-logos">
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/illinois-3.png" alt="Illinois" />
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/duke-3.png" alt="Duke" />
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/google.png" alt="Google" />
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/umich.jpeg" alt="University of Michigan" />
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/ibm.png" alt="IBM" />
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/imperial.png" alt="Imperial College" />
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/stanford.png" alt="Stanford" />
        <img src="https://pamutalwar.s3.eu-north-1.amazonaws.com/company/penn.png" alt="Penn" />
      </div>
    </section>
  );
};

export default CollaborationSection;

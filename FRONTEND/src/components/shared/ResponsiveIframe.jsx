// src/components/shared/ResponsiveIframe.jsx
import React from 'react';
import './ResponsiveIframe.css';

const ResponsiveIframe = ({ src, title }) => {
  return (
    <div className="iframe-container">
      <iframe
        src={src}
        title={title}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};
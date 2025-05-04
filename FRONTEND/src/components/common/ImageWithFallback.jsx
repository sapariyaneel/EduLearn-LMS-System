import React, { useState } from 'react';

/**
 * ImageWithFallback component to handle image errors automatically
 * 
 * @param {string} src - Primary image source URL
 * @param {string} fallbackSrc - Fallback image source URL
 * @param {object} props - Any other props to pass to the img element
 */
const ImageWithFallback = ({ 
  src, 
  fallbackSrc = 'https://placehold.co/100x100/eee/999?text=NA', 
  alt = 'Image',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  
  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };
  
  return (
    <img 
      src={imgSrc} 
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback; 
import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';

const VideoPreview = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const handleError = () => {
    console.log("Video playback error detected - showing fallback content");
    setError(true);
  };

  return (
    <section className="video-preview py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">See the Platform in Action</h2>
          <p className="lead">Watch a quick demonstration of our learning management system</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="row justify-content-center"
        >
          <div className="col-lg-10">
            <div className="ratio ratio-16x9 rounded shadow overflow-hidden">
              {!error ? (
                <ReactPlayer
                  url="https://www.youtube-nocookie.com/embed/5fAi943KNBk"
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  controls={true}
                  light="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  onClickPreview={() => setIsPlaying(true)}
                  onError={handleError}
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0,
                        origin: window.location.origin,
                        enablejsapi: 0
                      }
                    }
                  }}
                />
              ) : (
                <div className="bg-light d-flex flex-column align-items-center justify-content-center p-4 w-100 h-100">
                  <img 
                    src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                    alt="Video thumbnail" 
                    className="img-fluid rounded mb-3" 
                    style={{ maxHeight: '70%', objectFit: 'contain' }}
                  />
                  <p className="text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    Video preview is currently unavailable. <br />
                    Please visit our website to watch the full demonstration.
                  </p>
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <p className="text-muted">
                <i className="bi bi-info-circle me-2"></i>
                This video demonstrates how our platform enhances the learning experience
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoPreview; 
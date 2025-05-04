import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    role: "Web Development Student",
    content: "This platform has completely transformed my learning experience. The course materials are comprehensive and the instructors are truly experts in their fields.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Data Science Student",
    content: "I've tried many online learning platforms before, but this one stands out. The interactive quizzes and practical projects really help reinforce the concepts.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80"
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Mobile App Development Student",
    content: "The flexibility of learning at my own pace and the quality of the content made this the perfect solution for advancing my career while working full-time.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80"
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    role: "UX Design Student",
    content: "The community support and instructor feedback make a huge difference. I feel like I'm getting a premium education at a fraction of traditional costs.",
    avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=389&q=80"
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const Testimonials = () => {
  return (
    <section className="testimonials py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">What Our Students Say</h2>
          <p className="lead">Hear from those who have transformed their careers</p>
        </div>
        
        <div className="row g-4">
          {testimonials.map((testimonial, index) => (
            <div className="col-lg-6" key={testimonial.id}>
              <motion.div 
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="card h-100 border-0 shadow-sm"
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="rounded-circle me-3"
                      width="60"
                      height="60"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <h5 className="mb-0">{testimonial.name}</h5>
                      <p className="text-muted mb-0">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mb-0">"{testimonial.content}"</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 
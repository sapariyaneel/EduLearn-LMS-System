import React from 'react';
import { motion } from 'framer-motion';

const pricingPlans = [
  {
    id: 1,
    name: "Free",
    price: "0",
    features: [
      "Access to 5 free courses",
      "Basic assessments",
      "Community forum access",
      "24/7 support"
    ],
    recommended: false,
    buttonText: "Start For Free"
  },
  {
    id: 2,
    name: "Premium",
    price: "29",
    features: [
      "Unlimited course access",
      "Advanced assessments & quizzes",
      "Certificate on completion",
      "Priority support",
      "Downloadable resources"
    ],
    recommended: true,
    buttonText: "Get Premium"
  },
  {
    id: 3,
    name: "Enterprise",
    price: "99",
    features: [
      "Team management",
      "Analytics and reporting",
      "Custom learning paths",
      "API access",
      "Dedicated account manager",
      "White-labeling options"
    ],
    recommended: false,
    buttonText: "Contact Sales"
  }
];

const CTA = () => {
  return (
    <section className="cta py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Ready to Start Learning?</h2>
          <p className="lead">Choose a plan that works for you</p>
        </div>
        
        <div className="row">
          {pricingPlans.map((plan) => (
            <div key={plan.id} className="col-md-4 mb-4">
              <motion.div 
                whileHover={{ y: -10 }}
                className={`card h-100 shadow-sm ${plan.recommended ? 'border-primary' : 'border-0'}`}
              >
                {plan.recommended && (
                  <div className="card-header bg-primary text-white text-center py-3">
                    <h6 className="mb-0">Recommended</h6>
                  </div>
                )}
                <div className="card-body text-center p-4">
                  <h4 className="card-title">{plan.name}</h4>
                  <div className="py-3">
                    <span className="display-4 fw-bold">₹{plan.price}</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <ul className="list-unstyled text-start mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`btn ${plan.recommended ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100`}
                  >
                    {plan.buttonText}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
        
        <div className="row mt-5">
          <div className="col-md-8 mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3>Not ready to commit?</h3>
              <p className="lead mb-4">Try our 7-day free trial with full access to all premium features.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-lg btn-outline-dark"
              >
                Start Free Trial
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 
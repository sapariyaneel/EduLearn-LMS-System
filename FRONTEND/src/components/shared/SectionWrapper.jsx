// src/components/shared/SectionWrapper.jsx
const SectionWrapper = ({ children, bgColor = 'light' }) => {
    return (
      <section className={`py-5 bg-${bgColor}`}>
        <div className="container">
          {children}
        </div>
      </section>
    );
  };
  
  // Usage in Features.jsx:
  const Features = () => (
    <SectionWrapper>
      <h2>Our Features</h2>
      {/* Feature content */}
    </SectionWrapper>
  );
import React from 'react'
import Navigation from './Navigation.jsx'
import Footer from './Footer.jsx'

const MainLayout = ({ children, isLanding = false }) => {
  return (
    <div className={`d-flex flex-column ${isLanding ? 'landing-layout' : 'app-layout'}`}>
      <Navigation />
      
      <main className={isLanding ? '' : 'container py-4'}>
        {children}
      </main>
      
      <Footer />
    </div>
  )
}

export default MainLayout;
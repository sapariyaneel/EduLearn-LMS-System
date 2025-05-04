import React from 'react'
import Hero from './Hero.jsx'
import Features from './Features.jsx'
import HowItWorks from './HowItWorks.jsx'
import VideoPreview from './VideoPreview.jsx'
import Testimonials from './Testimonials.jsx'

const LandingPage = () => {
  return (
    <>
      <section id="home"><Hero /></section>
      <section id="features"><Features /></section>
      <section id="how-it-works"><HowItWorks /></section>
      <section id="demo"><VideoPreview /></section>
      <section id="testimonials"><Testimonials /></section>
    </>
  )
}

export default LandingPage
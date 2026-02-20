import { useState } from 'react';

import Footer from '../components/LandingPage/Footer';
import Navbar from '../components/LandingPage/Navbar';
import HeroSection from '../components/LandingPage/HeroSection';
import StatsSection from '../components/LandingPage/StatsSection';
import Features from '../components/LandingPage/Features';
import Benefits from '../components/LandingPage/Benefits';


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <HeroSection />
        <StatsSection />
        <Benefits />
        <Features />
        <Footer />
    </div>
  );
}
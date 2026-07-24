'use client';

import Navbar from './Navbar';
import Footer from './Footer';
import ParticleBackground from './ParticleBackground';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />
      <main className="relative z-10 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
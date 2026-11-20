import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CosmicBackground } from './components/sections/CosmicBackground';
import { ScrollStory } from './components/sections/ScrollStory';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { Students } from './components/sections/Students';
import { Contact } from './components/sections/Contact';

export const App: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#07060F] text-neutral-200 overflow-x-hidden selection:bg-brand-cyan/20 selection:text-brand-cyan">
      {/* Full-screen Deep-Space Cosmic Background with Particle Swarm */}
      <CosmicBackground />

      {/* Sticky Navigation Header */}
      <Navbar />

      {/* Main Single Scroll Story + Content Sections */}
      <main className="relative z-[1]">
        {/* Full-screen Sticky Scroll Sequence: Cloud Hero → Neon Helix with Cards → 3D Carousel */}
        <ScrollStory />

        {/* Content Sections */}
        <About />
        <Skills />
        <Projects />
        <Students />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;



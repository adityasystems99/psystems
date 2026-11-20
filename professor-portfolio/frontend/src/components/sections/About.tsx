import React, { useState } from 'react';
import { User, Award, BookOpen, Layers } from 'lucide-react';
import { Card } from '../ui/Card';
import { Reveal } from '../ui/Reveal';
import { profileConfig } from '../../config/profile';

export const About: React.FC = () => {
  const { professor } = profileConfig;
  const [imgError, setImgError] = useState(false);

  return (
    <section id="about" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Reveal>
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-brand-cyan px-3.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
            About The Educator
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Architecting Resilient Systems & Minds
          </h2>
          <div className="mt-4 w-12 h-1 bg-gradient-to-r from-brand-cyan to-brand-violet rounded-full" />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Portrait Slot / Fallback Placeholder */}
        <div className="lg:col-span-5 flex justify-center">
          <Reveal delayMs={100} className="w-full max-w-md">
            <div className="relative group">
              {/* Outer Decorative Gradient Ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-brand-cyan via-brand-violet to-brand-orange rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />

              <div className="relative rounded-2xl overflow-hidden glass-panel border border-white/10 aspect-[4/5] flex flex-col items-center justify-center p-6 bg-card/90">
                {!imgError ? (
                  <img
                    src={professor.photoUrl}
                    alt={professor.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-24 h-24 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                      <User className="w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">{professor.name}</h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        {professor.photoPlaceholderText}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-neutral-300">
                      <Award className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Distinguished Faculty</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Bio Copy & Key Highlights */}
        <div className="lg:col-span-7 space-y-6">
          <Reveal delayMs={200}>
            <div className="space-y-4">
              <h3 className="text-2xl font-light text-white tracking-tight flex items-center gap-3">
                <span>{professor.name}</span>
                <span className="text-xs font-mono text-brand-cyan px-2.5 py-0.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/5">
                  CS Faculty
                </span>
              </h3>
              <p className="text-lg text-brand-cyan/90 font-medium">
                {professor.tagline}
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={300}>
            <div className="space-y-4 text-neutral-300 leading-relaxed font-normal text-base">
              {professor.bioParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delayMs={400}>
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {professor.roles.map((role, idx) => (
                <Card key={idx} className="p-4 flex items-start gap-3 bg-white/[0.02]">
                  <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan shrink-0 mt-0.5">
                    {idx % 2 === 0 ? <BookOpen className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-neutral-200">
                    {role}
                  </span>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};


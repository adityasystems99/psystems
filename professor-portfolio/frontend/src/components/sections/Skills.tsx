import React from 'react';
import { Layout, Server, CheckCircle2, Code2, Cpu } from 'lucide-react';
import { Card } from '../ui/Card';
import { Reveal } from '../ui/Reveal';
import { profileConfig } from '../../config/profile';

export const Skills: React.FC = () => {
  const { skills } = profileConfig;

  return (
    <section id="skills" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background ambient blur */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-violet/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-brand-cyan/10 blur-[130px] rounded-full" />

      <Reveal>
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-brand-cyan px-3.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
            Technical Proficiency
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Full-Stack & Systems Expertise
          </h2>
          <p className="mt-4 text-neutral-400 max-w-xl text-base">
            Curated domains of teaching, research, and technical mastery.
          </p>
          <div className="mt-4 w-12 h-1 bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-orange rounded-full" />
        </div>
      </Reveal>

      {/* Two Column Grid: Frontend vs Backend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Frontend Column */}
        <Reveal delayMs={100}>
          <Card className="h-full p-8 border-brand-cyan/20 hover:border-brand-cyan/50">
            <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
              <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white tracking-tight flex items-center gap-2">
                  <span>Frontend Architecture</span>
                  <Code2 className="w-4 h-4 text-brand-cyan" />
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Modern Reactive UIs, WebGL Motion & Client Performance
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {skills.frontend.map((skill, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.06] transition-all duration-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* Backend Column */}
        <Reveal delayMs={200}>
          <Card className="h-full p-8 border-brand-violet/20 hover:border-brand-violet/50">
            <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
              <div className="p-3 rounded-xl bg-brand-violet/10 text-brand-violet border border-brand-violet/20">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white tracking-tight flex items-center gap-2">
                  <span>Backend & Systems</span>
                  <Cpu className="w-4 h-4 text-brand-violet" />
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Concurrency, Distributed Storage & High-Throughput APIs
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {skills.backend.map((skill, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-brand-violet/50 hover:bg-brand-violet/[0.06] transition-all duration-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-violet group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
};


import React, { useEffect, useState } from 'react';
import { ExternalLink, Github, FolderGit2, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Reveal } from '../ui/Reveal';
import { fetchProjects, ProjectItem } from '../../lib/api';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchProjects().then((data) => {
      if (isMounted) {
        setProjects(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="projects" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Reveal>
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-brand-cyan px-3.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
            Selected Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Research & Production Systems
          </h2>
          <p className="mt-4 text-neutral-400 max-w-xl text-base">
            Architectures engineered for scale, reliability, and academic rigor.
          </p>
          <div className="mt-4 w-12 h-1 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet rounded-full" />
        </div>
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-2xl glass-panel bg-white/[0.02]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-container">
          {projects.map((project, idx) => (
            <Reveal key={project.id} delayMs={idx * 100}>
              <Card className="h-full flex flex-col justify-between group tilted-card hover:shadow-[0_15px_35px_rgba(0,240,255,0.15)]">
                <div>
                  {/* Card Header & Links */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 text-brand-cyan">
                      <FolderGit2 className="w-5 h-5" />
                      <span className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                        Project #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`GitHub Repository for ${project.title}`}
                          className="p-2 rounded-lg bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Live Demo for ${project.title}`}
                          className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-background transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div className="mt-5 space-y-3">
                    <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight group-hover:text-brand-cyan transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-neutral-300 font-normal leading-relaxed">
                      {project.summary}
                    </p>
                  </div>
                </div>

                {/* Tech Stack Chips */}
                <div className="mt-8 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                  {project.stack.map((tech, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-white/[0.04] text-neutral-300 border border-white/[0.06] group-hover:border-brand-cyan/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
};


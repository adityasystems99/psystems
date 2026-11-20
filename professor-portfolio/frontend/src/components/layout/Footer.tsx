import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';
import { profileConfig } from '../../config/profile';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/[0.08] bg-background pt-16 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-brand-cyan/5 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand & Roles */}
          <div className="text-center md:text-left">
            <span className="text-xl font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-cyan" />
              {profileConfig.professor.name}
            </span>
            <p className="mt-1 text-sm text-neutral-400">
              {profileConfig.professor.title}
            </p>
          </div>

          {/* Social / External Links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {profileConfig.footer.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-wider font-mono text-neutral-400 hover:text-brand-cyan px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-brand-cyan/40 bg-white/[0.02] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="p-3 rounded-full border border-white/[0.1] bg-white/[0.03] text-neutral-400 hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Attribution Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {profileConfig.footer.copyrightName}. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-neutral-400">
            <span>{profileConfig.footer.creditText}</span>
            <Heart className="w-3.5 h-3.5 text-brand-coral inline fill-brand-coral/40" />
          </p>
        </div>
      </div>
    </footer>
  );
};


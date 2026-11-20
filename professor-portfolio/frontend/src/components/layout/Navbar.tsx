import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Github } from 'lucide-react';
import { profileConfig } from '../../config/profile';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-lg shadow-black/40'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Professor Name Brand */}
        <a
          href="#"
          className="group flex items-center gap-2 text-white font-medium text-lg tracking-tight hover:text-brand-cyan transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-violet animate-glow-pulse" />
          <span>{profileConfig.professor.name}</span>
          <span className="hidden sm:inline-block text-xs text-neutral-400 font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
            Faculty
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-full backdrop-blur-md">
          {profileConfig.navigation.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Quick CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="https://github.com/adityasystems99/psystems"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs tracking-wider font-mono font-medium px-3.5 py-2 rounded-full border border-white/15 bg-white/[0.04] text-neutral-300 hover:text-white hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/10 transition-all shadow-sm"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>psystems</span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-background transition-all"
          >
            <span>Connect</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/[0.1] px-6 py-6 space-y-3 transition-all animate-in fade-in slide-in-from-top-2">
          {profileConfig.navigation.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-neutral-200 hover:text-brand-cyan hover:bg-white/[0.04] rounded-lg"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-1 text-sm font-semibold px-4 py-2.5 rounded-full bg-brand-cyan text-background hover:brightness-110"
            >
              <span>Connect with Professor</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};


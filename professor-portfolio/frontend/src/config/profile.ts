export interface ProfileConfig {
  professor: {
    name: string;
    title: string;
    badge: string;
    tagline: string;
    bioParagraphs: string[];
    photoUrl: string;
    photoPlaceholderText: string;
    roles: string[];
  };
  navigation: {
    links: Array<{ label: string; href: string }>;
  };
  hero: {
    badge: string;
    headlineDesktop: string;
    headlineMobile: string;
    secondaryLine: string;
    subheadline: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  skills: {
    frontend: string[];
    backend: string[];
  };
  contact: {
    title: string;
    subtitle: string;
    formLabels: {
      name: string;
      email: string;
      message: string;
      submitBtn: string;
      submittingBtn: string;
    };
    feedbackMessages: {
      success: string;
      error: string;
      rateLimited: string;
    };
  };
  footer: {
    copyrightName: string;
    creditText: string;
    links: Array<{ label: string; url: string }>;
  };
}

export const profileConfig: ProfileConfig = {
  professor: {
    name: "Professor Lalit Kumar Vashishtha",
    title: "Assistant Professor of Computer Science at KIIT · PhD candidate at BITS Pilani · Hardware security on RISC-V and formal methods",
    badge: "3D RESEARCH PORTFOLIO · HARDWARE SECURITY",
    tagline: "Inspiring the next generation of full-stack engineers and backend system architects.",
    bioParagraphs: [
      "Professor Lalit Kumar Vashishtha is dedicated to research in hardware security, RISC-V processor verification, distributed systems, and modern computing architectures.",
      "Over years of academic leadership, he has guided students through advanced systems research, critical thinking, and resilient engineering architectures."
    ],
    photoUrl: "/images/professor.jpg",
    photoPlaceholderText: "Professor Lalit Kumar Vashishtha",
    roles: [
      "Assistant Professor of Computer Science at KIIT",
      "PhD Candidate at BITS Pilani",
      "Hardware Security & RISC-V Researcher"
    ]
  },
  navigation: {
    links: [
      { label: "About", href: "#about" },
      { label: "Skills", href: "#skills" },
      { label: "Projects", href: "#projects" },
      { label: "Students", href: "#students" },
      { label: "Contact", href: "#contact" }
    ]
  },
  hero: {
    badge: "• 3D RESEARCH PORTFOLIO · HARDWARE SECURITY",
    headlineDesktop: "Professor Lalit Kumar Vashishtha",
    headlineMobile: "Professor Lalit Kumar Vashishtha",
    secondaryLine: "Assistant Professor of Computer Science at KIIT · PhD candidate at BITS Pilani · Hardware security on RISC-V and formal methods",
    subheadline: "Hardware security on RISC-V architectures, formal verification, and resilient distributed systems.",
    primaryCta: { label: "Google Scholar", href: "https://scholar.google.com" },
    secondaryCta: { label: "Contact", href: "#contact" }
  },
  skills: {
    frontend: [
      "React & Next.js",
      "TypeScript",
      "Tailwind CSS",
      "WebGL & Three.js",
      "Vite & Modern Bundlers",
      "Browser Architecture & DOM Internals"
    ],
    backend: [
      "FastAPI & Python",
      "Node.js & Express",
      "Distributed Systems & Microservices",
      "PostgreSQL & SQLite",
      "Concurrency & Asynchronous Queues",
      "Docker & Container Orchestration"
    ]
  },
  contact: {
    title: "Get in Touch",
    subtitle: "Have a research inquiry, student question, or collaboration opportunity? Send a direct note.",
    formLabels: {
      name: "Your Name",
      email: "Your Email Address",
      message: "Your Message",
      submitBtn: "Send Message",
      submittingBtn: "Transmitting..."
    },
    feedbackMessages: {
      success: "Message successfully transmitted. Thank you!",
      error: "Unable to send message right now. Please verify your fields and try again.",
      rateLimited: "You have reached the rate limit (5 messages / minute). Please wait a moment before trying again."
    }
  },
  footer: {
    copyrightName: "Professor Lalit Kumar Vashishtha",
    creditText: "Designed & engineered with deep gratitude.",
    links: [
      { label: "GitHub", url: "https://github.com/adityasystems99/psystems" },
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "University Faculty Page", url: "https://kiit.ac.in" }
    ]
  }
};


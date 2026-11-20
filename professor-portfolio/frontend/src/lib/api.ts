export interface ProjectItem {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  image?: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  message: string;
  created_at?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  type?: 'contact' | 'testimonial';
}

export interface ContactResponse {
  status: string;
  message: string;
  id: number;
}

// Resilient fallback seed data if backend API is offline
const FALLBACK_PROJECTS: ProjectItem[] = [
  {
    id: "distributed-task-orchestrator",
    title: "Distributed Task Orchestrator",
    summary: "High-throughput asynchronous task queue engine built with FastAPI and distributed worker nodes for fault-tolerant data pipelines.",
    stack: ["FastAPI", "Python", "Redis", "SQLAlchemy", "Docker"],
    liveUrl: "https://demo.example.com/orchestrator",
    repoUrl: "https://github.com/adityasystems99/psystems",
    image: "/images/project-1.png"
  },
  {
    id: "realtime-collaborative-ide",
    title: "Realtime Collaborative Cloud IDE",
    summary: "Browser-based distributed code workspace supporting concurrent editing with CRDTs, containerized sandbox execution, and WebSocket synchronization.",
    stack: ["React", "TypeScript", "Node.js", "WebSockets", "Docker"],
    liveUrl: "https://demo.example.com/cloud-ide",
    repoUrl: "https://github.com/adityasystems99/psystems",
    image: "/images/project-2.png"
  },
  {
    id: "microservices-api-gateway",
    title: "High-Performance API Gateway & Sentinel",
    summary: "Zero-trust reverse proxy and telemetry gateway with dynamic token validation, sliding-window rate limiting, and distributed tracing.",
    stack: ["Go", "FastAPI", "SQLite", "OpenTelemetry", "Tailwind CSS"],
    liveUrl: "https://demo.example.com/gateway",
    repoUrl: "https://github.com/adityasystems99/psystems",
    image: "/images/project-3.png"
  },
  {
    id: "academic-peer-evaluator",
    title: "Academic Research & Peer-Review Hub",
    summary: "Decentralized archival platform for university researchers, indexing whitepapers, automated citation tracking, and double-blind peer grading.",
    stack: ["React", "Vite", "FastAPI", "PostgreSQL", "Tailwind CSS"],
    liveUrl: "https://demo.example.com/research-hub",
    repoUrl: "https://github.com/adityasystems99/psystems",
    image: "/images/project-4.png"
  }
];

export async function fetchProjects(): Promise<ProjectItem[]> {
  try {
    const res = await fetch('/api/projects', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_PROJECTS;
  } catch (err) {
    console.warn('API /api/projects unavailable, using fallback seed projects', err);
    return FALLBACK_PROJECTS;
  }
}

export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  try {
    const res = await fetch('/api/testimonials', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('API /api/testimonials unavailable', err);
    return [];
  }
}

export async function submitContact(payload: ContactPayload): Promise<ContactResponse> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.status === 429) {
    throw new Error('RATE_LIMITED');
  }

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Server error (${res.status})`);
  }

  return res.json();
}


# System Architecture Document: Professor Portfolio Website

## 1. Executive Summary & Goals
The goal of this project is to build an elegant, cinematic, high-performance portfolio and tribute website for **{{PROFESSOR_NAME}}**. The platform highlights his academic contributions, backend engineering expertise, and mentorship impact. It features an immersive WebGL hero canvas alongside clean, accessible, and responsive content sections.

Key constraints & quality bars:
- Zero hardcoded content: All textual data, biographies, and links originate from `src/config/profile.ts` and `backend/data/*.json`.
- Resilient offline fallback: Frontend functions seamlessly even if the FastAPI backend service is offline.
- Performance & Accessibility: Lighthouse performance &ge; 85 on mobile; WCAG 2.1 AA compliant contrast (&ge; 4.5:1), keyboard navigation, semantic HTML, and reduced-motion support.

---

## 2. Directory Layout & Roles

```text
professor-portfolio/
├── README.md                          # Full operational and deployment documentation
├── docker-compose.yml                 # Multi-container orchestration (FastAPI + Vite static/dev)
├── docs/
│   ├── video-notes.md                 # Design reel breakdown and timing specifications
│   └── architecture.md                # System design and component contract (this document)
├── frontend/                          # Vite + React + TypeScript + Tailwind CSS
│   ├── public/images/                 # Static assets (professor portrait, project thumbnails)
│   └── src/
│       ├── config/profile.ts          # Central source of truth for site content & placeholders
│       ├── shaders/                   # Custom GLSL vertex and fragment shaders
│       │   ├── hero.vert.glsl
│       │   └── hero.frag.glsl
│       ├── hooks/                     # Custom React hooks
│       │   ├── useHeroTimeline.ts     # 10s timeline controller, RAF loop, canvas lifecycle
│       │   └── useReducedMotion.ts    # Accessibility media query listener
│       ├── lib/api.ts                 # Type-safe HTTP client with transparent offline fallbacks
│       ├── components/
│       │   ├── layout/Navbar.tsx, Footer.tsx
│       │   ├── sections/Hero.tsx, HeroCanvas.tsx, About.tsx, Skills.tsx,
│       │   │            Projects.tsx, Students.tsx, Contact.tsx
│       │   └── ui/Button.tsx, Card.tsx, Reveal.tsx
│       └── styles/globals.css
└── backend/                           # FastAPI + SQLite + SQLAlchemy
    ├── data/
    │   ├── profile.json               # Seed profile dataset
    │   └── projects.json              # Seed projects dataset
    ├── app/
    │   ├── main.py                    # Application factory, middleware & router aggregation
    │   ├── db.py                      # Engine, sessionmaker, Base definition
    │   ├── models.py                  # SQLAlchemy ORM models (Project, Message)
    │   ├── schemas.py                 # Pydantic v2 validation models
    │   ├── core/config.py             # Settings, CORS, rate-limit configurations
    │   └── routers/
    │       ├── health.py              # GET /api/health
    │       ├── profile.py             # GET /api/profile
    │       ├── projects.py            # GET /api/projects
    │       └── contact.py             # POST /api/contact, GET /api/testimonials
    └── tests/test_api.py              # Test suite using pytest and HTTPX
```

---

## 3. Frontend Architecture

### 3.1 Technology Stack
- **Framework**: React 18 / 19 with TypeScript in strict mode.
- **Build System**: Vite 6+ for fast HMR and optimized production bundles.
- **Styling**: Tailwind CSS with custom theme extensions (`#05060a` dark background, electric blue `#00f0ff`, violet `#8b5cf6`, warm orange `#f97316`).
- **Graphics**: Three.js rendering via a dedicated Canvas component with raw GLSL shaders.

### 3.2 State Management & Data Flow
- **Single Source of Truth**: `src/config/profile.ts` provides default metadata, navigation structure, skills, and thank-you text.
- **Resilient API Layer (`src/lib/api.ts`)**:
  - `fetchProjects()`: Queries `GET /api/projects`. If the request fails or times out, it gracefully loads local seed data imported from `backend/data/projects.json` or bundled fallback.
  - `fetchTestimonials()`: Queries `GET /api/testimonials` (approved student messages only).
  - `submitContact(payload)`: Sends contact or testimonial submissions to `POST /api/contact`.
- **Component Hierarchy**:
  - `Navbar`: Sticky blurred backdrop, links to page anchors, keyboard trap in mobile menu.
  - `Hero` & `HeroCanvas`: Full-viewport canvas, overlay text, responsive CTAs.
  - `About`: Biography, credentials, and image container (`professor.jpg` or placeholder fallback).
  - `Skills`: Two-column grid (Frontend vs. Backend) with animated chips.
  - `Projects`: Tilted 3D cards that flatten upon scrolling into view, featuring interactive glare.
  - `Students`: Carousel of approved student testimonials with a modal/inline "Leave a Message" form.
  - `Contact`: Validated inquiry form with status messages and rate-limit handling.
  - `Footer`: Quick links, social badges, and attribution line.

---

## 4. Hero WebGL & Shader Architecture

### 4.1 Particle Dynamics
- **Desktop**: ~12,000 points.
- **Mobile**: ~5,000 points (to respect low-power GPUs).
- **DPR Scaling**: `Math.min(window.devicePixelRatio, 2.0)` to eliminate mobile thermal throttling.
- **Intersection & Visibility**: Pauses the `requestAnimationFrame` loop when the Hero section is off-screen (via `IntersectionObserver`) or when `document.hidden` is true.

### 4.2 Timeline State Machine (`useHeroTimeline.ts`)
A cyclical 10-second timeline with timing constants configured in a central object:
```ts
export const TIMELINE_CONFIG = {
  DURATION: 10.0,
  PHASES: {
    RIBBON: { start: 0.0, end: 2.5 },
    WAVE: { start: 2.5, end: 4.5 },
    VORTEX: { start: 4.5, end: 7.0 },
    FLASH: { start: 7.0, end: 7.4 },
    GALAXY: { start: 7.4, end: 10.0 },
  },
  PALETTE: {
    base: '#05060a',
    electricBlue: '#00f0ff',
    violet: '#8b5cf6',
    warmOrange: '#f97316',
  }
};
```
- **Phase 1 (0.0s – 2.5s)**: Fluid undulating ribbon with spatial noise.
- **Phase 2 (2.5s – 4.5s)**: Horizontal planar wave dispersing across the screen.
- **Phase 3 (4.5s – 7.0s)**: Central vortex attractor responding dynamically to mouse/touch coordinates.
- **Phase 4 (7.0s – 7.4s)**: Brief subtle white-violet luminosity flash.
- **Phase 5 (7.4s – 10.0s)**: Spiral galaxy bloom settling back into ribbon flow.

### 4.3 Accessibility & Fallbacks
- **`prefers-reduced-motion`**: Detects OS preference; bypasses the timeline animation and renders a static, settled constellation.
- **WebGL Unavailable**: If WebGL context creation fails, renders a CSS radial vignette gradient backdrop with soft particle simulation or CSS glow.

---

## 5. Backend Architecture (FastAPI + SQLite)

### 5.1 Technology Stack
- **Framework**: FastAPI (async ASGI).
- **ORM / Database**: SQLAlchemy 2.0 with a local SQLite database (`app.db`).
- **Rate Limiting**: `slowapi` utilizing the client's remote IP (5 requests per minute on `/api/contact`).
- **Validation**: Pydantic v2 schemas for request and response models.

### 5.2 API Contract & Endpoints
| Endpoint | Method | Description | Rate Limit |
|---|---|---|---|
| `/api/health` | `GET` | Health check probe &rarr; `{"status": "ok"}` | None |
| `/api/profile` | `GET` | Returns contents of `backend/data/profile.json` | None |
| `/api/projects` | `GET` | Returns list of projects from SQLite (seeded from `projects.json` if empty) | None |
| `/api/testimonials` | `GET` | Returns list of approved student messages (`approved == True`, `type == "testimonial"`) | None |
| `/api/contact` | `POST` | Accepts `{ name, email, message, type? }`. Validates lengths, formats, and stores in SQLite (`approved=False` for testimonials) | 5 / minute / IP |

### 5.3 Database Models
- **`Project`**:
  - `id`: String (UUID or slug, primary key)
  - `title`: String
  - `summary`: Text
  - `stack`: JSON / String array
  - `live_url`: String (optional)
  - `repo_url`: String (optional)
  - `image`: String (optional)
- **`Message`**:
  - `id`: Integer (Primary Key, autoincrement)
  - `name`: String (1–100 chars)
  - `email`: String (valid email)
  - `message`: Text (10–1000 chars)
  - `type`: String (`"contact"` or `"testimonial"`, default `"contact"`)
  - `approved`: Boolean (default `False`)
  - `created_at`: DateTime (UTC timestamp)

---

## 6. Security, Performance & Quality Assurance

1. **Security**:
   - Strict input validation via Pydantic on incoming contact/testimonial payloads.
   - CORS middleware restricted to `ALLOWED_ORIGINS` (configurable in `.env`).
   - SQLite atomic queries and prepared statements via SQLAlchemy ORM (prevents SQL injection).
2. **Performance Target**:
   - Mobile Lighthouse score &ge; 85 for static and interactive sections.
   - Assets lazy-loaded, fonts preconnected, DPR clamped.
3. **Automated Testing**:
   - Backend test suite in `backend/tests/test_api.py` run via `pytest`.
   - Comprehensive test coverage for health, profile retrieval, project seeding, contact submission validation, IP rate limiting, and testimonial moderation filtering.
4. **Containerization**:
   - `docker-compose.yml` declaring `frontend` (Vite dev or Nginx static server) and `backend` (Uvicorn FastAPI server) on a shared internal bridge network.


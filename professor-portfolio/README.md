# Professor Portfolio & Academic Tribute — {{PROFESSOR_NAME}}

A cinematic, high-performance web development and systems engineering portfolio designed as a personal thank-you tribute for **{{PROFESSOR_NAME}}**. Built with an interactive 10-second looping Three.js + GLSL particle hero canvas, modern dark aesthetics, responsive layout, and a resilient FastAPI + SQLite backend.

---

## 🌟 Visual & Motion Design Highlights
- **WebGL Hero Shaders (`hero.vert.glsl`, `hero.frag.glsl`)**:
  - Full-viewport particle canvas (~12k desktop / ~5k mobile) with dual-hue chromatic ramp (Electric Cyan `#00f0ff` → Deep Violet `#8b5cf6` → Warm Orange `#f97316`).
  - Looping 10-second sequence:
    1. **0.0s – 2.5s (Ribbon)**: Undulating particle ring with sine/curl noise.
    2. **2.5s – 4.5s (Wave)**: Horizontal dispersion planar wave across the screen.
    3. **4.5s – 7.0s (Vortex)**: Gravitational attractor responding to mouse/touch coordinates.
    4. **7.0s – 7.4s (Flash)**: Chromatic transition flash.
    5. **7.4s – 10.0s (Galaxy)**: 3D spiral galaxy disk settling back into ribbon flow.
- **Accessibility & Performance**:
  - Automatically respects `prefers-reduced-motion` (renders a static composite galaxy frame).
  - Pauses the animation loop when tab is hidden or when scrolled out of view (`IntersectionObserver`).
  - Device pixel ratio capped at `Math.min(window.devicePixelRatio, 2.0)` to eliminate GPU thermal throttling.
  - CSS radial vignette fallback when WebGL is unavailable.
- **3D Card Tilt with Interactive Glare**: Project cards dynamically follow cursor position and flatten on scroll.

---

## 📁 Project Architecture & File Map

```text
professor-portfolio/
├── README.md                      # Operational & content guide (this file)
├── docker-compose.yml             # Docker multi-container specification
├── docs/
│   ├── video-notes.md             # Deconstructed reference reel timings & palette
│   └── architecture.md            # System design & component contracts
├── frontend/                      # Vite + React + TypeScript + Tailwind CSS
│   ├── public/images/             # professor.jpg & project preview images
│   └── src/
│       ├── config/profile.ts      # SINGLE SOURCE OF TRUTH for all site copy & placeholders
│       ├── shaders/
│       │   ├── hero.vert.glsl     # Particle dynamics & phase morphing
│       │   └── hero.frag.glsl     # Soft circular disc point styling
│       ├── hooks/
│       │   ├── useHeroTimeline.ts # Central timing config & Three.js RAF lifecycle
│       │   └── useReducedMotion.ts# Reduced motion media query listener
│       ├── lib/api.ts             # Type-safe client with transparent offline fallbacks
│       ├── components/
│       │   ├── layout/Navbar.tsx, Footer.tsx
│       │   ├── sections/Hero.tsx, HeroCanvas.tsx, About.tsx, Skills.tsx,
│       │   │            Projects.tsx, Students.tsx, Contact.tsx
│       │   └── ui/Button.tsx, Card.tsx, Reveal.tsx
│       └── styles/globals.css
└── backend/                       # FastAPI + SQLite + SQLAlchemy
    ├── data/
    │   ├── profile.json           # Seed profile dataset
    │   └── projects.json          # Seed projects dataset
    ├── app/
    │   ├── main.py                # FastAPI app, CORS, rate limits
    │   ├── db.py                  # SQLAlchemy engine & sessionmaker
    │   ├── models.py              # Project & Message ORM models
    │   ├── schemas.py             # Pydantic v2 validation models
    │   ├── core/config.py         # Config & environment variables
    │   ├── core/limiter.py        # SlowAPI rate limiter
    │   └── routers/
    │       ├── health.py          # GET /api/health
    │       ├── profile.py         # GET /api/profile
    │       ├── projects.py        # GET /api/projects
    │       └── contact.py         # POST /api/contact, GET /api/testimonials
    └── tests/test_api.py          # Pytest + HTTPX test suite
```

---

## 🚀 Quick Start (Local Development)

### 1. Run Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- Interactive OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run Frontend (Vite + React)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5174](http://localhost:5174) in your browser.

### 3. Run Backend Test Suite
```bash
cd backend
python -m pytest -c pytest.ini --rootdir=. tests
```

---

## 🐳 Running via Docker Compose

To build and run both the frontend and backend in isolated containers:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:5174](http://localhost:5174)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## ⚙️ Environment Variables

The backend supports configuration via environment variables:

| Variable | Default Value | Description |
|---|---|---|
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174` | Comma-separated list of allowed CORS origins |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLAlchemy database connection string |
| `RATE_LIMIT` | `5/minute` | Rate limit threshold per IP on `/api/contact` |

---

## ✏️ How to Edit Content & Replace Placeholders

All site content is configuration-driven. Never edit hardcoded text inside UI components:

1. **Professor Bio, Credentials, Skills & Gratitude Letter**:
   - Edit [`frontend/src/config/profile.ts`](file:///c:/Users/KIIT/OneDrive/Desktop/portpolio%20-%202/professor-portfolio/frontend/src/config/profile.ts).
   - Replace any `{{PROFESSOR_NAME}}`, `{{PROFESSOR_TITLE}}`, `{{PROFESSOR_BIO}}`, and `{{YOUR_NAME}}` placeholders.
2. **Projects**:
   - Edit [`backend/data/projects.json`](file:///c:/Users/KIIT/OneDrive/Desktop/portpolio%20-%202/professor-portfolio/backend/data/projects.json).
3. **Professor Portrait**:
   - Place a photo named `professor.jpg` into `frontend/public/images/professor.jpg`. If omitted, an elegant fallback SVG avatar placeholder renders automatically.

---

## 🛡️ Moderation: How to Approve Student Testimonials

By design, student messages submitted via the "Leave a Message" form (`POST /api/contact` with `type="testimonial"`) are stored in the SQLite database with `approved = 0` (unapproved) to prevent unsolicited content from appearing publicly.

To approve a student testimonial so it displays in the "Words from students" carousel:

1. Open SQLite from terminal:
   ```bash
   sqlite3 backend/app.db
   ```
2. View pending submissions:
   ```sql
   SELECT id, name, message, created_at FROM messages WHERE type = 'testimonial' AND approved = 0;
   ```
3. Approve a specific submission:
   ```sql
   UPDATE messages SET approved = 1 WHERE id = <TESTIMONIAL_ID>;
   ```
4. Verify approved entries:
   ```sql
   SELECT id, name, approved FROM messages WHERE type = 'testimonial';
   ```
   Approved entries immediately appear upon refreshing the portfolio page.


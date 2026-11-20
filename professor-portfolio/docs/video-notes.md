# Video Reference & Design Reel Notes

## Visual Mood & Aesthetic Reference
- **Theme**: Cinematic, futuristic academic portfolio with a personal, heartfelt tone.
- **Base Color**: Dark, near-black void (`#05060a`) with subtle radial vignette falloff.
- **Color Transitions / Accents**:
  - Primary: Electric Blue (`#00f0ff` / `#38bdf8`)
  - Secondary: Deep Violet / Purple (`#8b5cf6` / `#a855f7`)
  - Accent / Warmth: Warm Orange / Gold (`#f97316` / `#fb923c`)
- **Atmosphere**: Cosmic flow, particle depth, soft ethereal glow without excessive bloom or visual clutter.

## Hero Experience & Canvas Choreography
The Hero is driven by a full-viewport WebGL canvas (Three.js with custom GLSL vertex/fragment shaders) executing a continuous 10-second cyclical timeline:

1. **Phase 1: Flowing Ribbon (0.0s – 2.5s)**
   - ~12k particles (desktop) / ~5k particles (mobile) streaming as a coherent ribbon undulating across the screen.
   - Smooth sine/curl noise displacement in vertex shader.
   - Color gradient shifting from electric blue to soft violet.

2. **Phase 2: Horizontal Dispersion Wave (2.5s – 4.5s)**
   - Ribbon accelerates and ripples outward into a wide horizontal planar wave across the viewport.
   - Particles disperse slightly, increasing perceived depth and spatial scale.

3. **Phase 3: Central Glowing Vortex (4.5s – 7.0s)**
   - Gravitational attractor pulls particles inward toward viewport center.
   - Central vortex spins with cursor-reactive repulsion/attraction physics.
   - Main headline illuminates with soft glow above the vortex.

4. **Phase 4: Chromatic Transition Flash (7.0s – 7.4s)**
   - Brief, subtle white/violet particle flash and scale expansion (200ms–400ms).
   - Resets vertex attractor vector without jarring jumps.

5. **Phase 5: Violet Galaxy & Tagline (7.4s – 10.0s)**
   - Particles blossom into a rotating spiral galaxy accented with deep violet and warm orange fringes.
   - Secondary headline / tagline fades in gently.
   - Seamlessly blends back into Phase 1 ribbon dynamics.

## Typography & UI Elements
- **Headline Font**: Modern light-weight sans-serif (Inter / Geist), `clamp(2.25rem, 5vw, 4.5rem)` (36–44px mobile, 56–72px desktop).
- **CTA Actions**:
  - Primary Pill Button: Solid bright accent with subtle hover glow ("View projects").
  - Secondary Pill Button: Ghost / frosted glass border ("Contact").
- **Motion Spec**:
  - `prefers-reduced-motion`: Disables animation loop, renders static composite galaxy frame.
  - Off-screen optimization: Tab hidden or hero scrolled out of view pauses the requestAnimationFrame loop.
  - DPR: Capped at `Math.min(window.devicePixelRatio, 2)` to protect mobile GPU thermal/battery limits.
  - Fallback: Graceful CSS radial glow gradient if WebGL context creation fails.

## Scroll Sections Direction
- Tilted 3D grid for projects with subtle isometric pitch (~6deg) flattening to 0deg as they enter viewport center.
- Glare shine on card hover following mouse coordinates.
- Staggered entrance animations on scroll triggers.
- Strictly enforced 16px lateral gutters to prevent horizontal overflow on narrow mobile screens.


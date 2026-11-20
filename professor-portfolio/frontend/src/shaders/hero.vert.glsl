uniform float uTime;
uniform float uPhase; // 0.0 to 1.0 normalized over 10s loop
uniform vec2 uMouse;  // normalized mouse coords (-1.0 to 1.0)
uniform float uAspect;
uniform float uPixelRatio;

attribute vec3 aInitialPos;
attribute vec3 aGalaxyPos;
attribute vec3 aVortexPos;
attribute float aSize;
attribute float aSeed;

varying vec3 vColor;
varying float vAlpha;

#define PI 3.14159265359

// Colors
const vec3 COLOR_CYAN   = vec3(0.0, 0.94, 1.0);     // #00f0ff
const vec3 COLOR_VIOLET = vec3(0.54, 0.36, 0.96);   // #8b5cf6
const vec3 COLOR_ORANGE = vec3(0.98, 0.45, 0.09);   // #f97316
const vec3 COLOR_CORAL  = vec3(1.0, 0.28, 0.22);    // #ff4738
const vec3 COLOR_WHITE  = vec3(1.0, 1.0, 1.0);

void main() {
    float t = uTime;
    
    // Determine blend weights between ribbon, wave, vortex, and galaxy
    // Phase Timeline (10 seconds total):
    // 0.00 - 0.25: Ribbon (portal ring)
    // 0.25 - 0.45: Horizontal dispersion wave
    // 0.45 - 0.70: Glowing central vortex with cursor attraction
    // 0.70 - 0.74: Flash transition
    // 0.74 - 1.00: 3D spiral galaxy disk
    
    vec3 pos = aInitialPos;
    
    // 1. Portal Ring / Ribbon Undulation (Phases 1 & 2)
    float waveX = sin(pos.y * 3.0 + t * 2.0 + aSeed * 5.0) * 0.15;
    float waveY = cos(pos.x * 3.0 + t * 1.5 + aSeed * 4.0) * 0.15;
    vec3 ribbonPos = aInitialPos + vec3(waveX, waveY, sin(pos.x + t) * 0.2);

    // 2. Vortex Attraction with Cursor Reaction (Phase 3)
    vec3 vortex = aVortexPos;
    float angle = atan(vortex.y, vortex.x) + t * 1.5;
    float radius = length(vortex.xy);
    vec3 spinningVortex = vec3(cos(angle) * radius, sin(angle) * radius, vortex.z + sin(radius * 10.0 - t * 4.0) * 0.15);
    
    // Mouse displacement
    vec2 toMouse = spinningVortex.xy - (uMouse * 1.2);
    float mouseDist = length(toMouse);
    if (mouseDist < 0.8) {
        float push = (0.8 - mouseDist) * 0.35;
        spinningVortex.xy += normalize(toMouse) * push;
    }

    // 3. Galaxy Spiral Disk (Phase 5)
    vec3 galaxy = aGalaxyPos;
    float gAngle = atan(galaxy.y, galaxy.x) + t * 0.6;
    float gRadius = length(galaxy.xy);
    vec3 spinningGalaxy = vec3(cos(gAngle) * gRadius, sin(gAngle) * gRadius, galaxy.z + sin(gRadius * 6.0 - t * 2.0) * 0.08);

    // Interpolate positions based on uPhase
    float p = uPhase;
    vec3 targetPos = ribbonPos;
    float flashIntensity = 0.0;

    if (p < 0.25) {
        // Pure ribbon ring
        targetPos = ribbonPos;
    } else if (p < 0.45) {
        // Disperse into planar wave
        float localP = (p - 0.25) / 0.20;
        vec3 planarWave = vec3(ribbonPos.x * 1.4, ribbonPos.y * 0.6 + sin(ribbonPos.x * 5.0 + t * 3.0) * 0.2, ribbonPos.z);
        targetPos = mix(ribbonPos, planarWave, smoothstep(0.0, 1.0, localP));
    } else if (p < 0.70) {
        // Morph into glowing central vortex
        float localP = (p - 0.45) / 0.25;
        targetPos = mix(ribbonPos, spinningVortex, smoothstep(0.0, 1.0, localP));
    } else if (p < 0.74) {
        // Brief white flash transition
        float localP = (p - 0.70) / 0.04;
        flashIntensity = sin(localP * PI);
        targetPos = mix(spinningVortex, spinningGalaxy, localP);
        targetPos += (normalize(targetPos + vec3(0.001)) * flashIntensity * 0.25);
    } else {
        // Tilted spiral galaxy disk blending back to ribbon
        float localP = (p - 0.74) / 0.26;
        targetPos = mix(spinningGalaxy, ribbonPos, smoothstep(0.8, 1.0, localP));
    }

    // Color computation
    // Left: Cyan, Right: Orange/Coral, Bottom/Back: Violet
    float colorBias = clamp((targetPos.x + 1.2) / 2.4, 0.0, 1.0);
    vec3 baseColor = mix(COLOR_CYAN, COLOR_ORANGE, colorBias);
    
    // Accent violet depth on z or low y
    if (targetPos.y < 0.0) {
        baseColor = mix(baseColor, COLOR_VIOLET, clamp(-targetPos.y * 0.8, 0.0, 0.8));
    }
    
    // Add flash luminosity
    vColor = mix(baseColor, COLOR_WHITE, flashIntensity * 0.85);

    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size with DPR scaling
    float pointScale = 280.0 * uPixelRatio;
    gl_PointSize = (aSize * pointScale) / (-mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.5, 45.0);

    // Alpha fade near edges
    vAlpha = clamp(1.0 - (length(targetPos.xy) / 3.0), 0.2, 0.95);
}


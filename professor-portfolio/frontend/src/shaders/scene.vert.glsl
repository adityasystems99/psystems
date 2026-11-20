uniform float uProgress;      // cp = p / 0.6
uniform float uTime;
uniform float uPixelRatio;
uniform float uChainHeight;
uniform float uTurns;
uniform float uHelixRadius;
uniform float uAspect;

attribute vec3 aHelixPos;
attribute float aSeed;
attribute float aStrand;       // 0.0 = Strand A (Cyan), 1.0 = Strand B (Magenta), 2.0 = Dust (Violet)
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;
varying float vShimmer;

#define PI 3.14159265359

const vec3 COLOR_CYAN    = vec3(0.0, 0.941, 1.0);    // #00F0FF
const vec3 COLOR_MAGENTA = vec3(1.0, 0.169, 0.839);  // #FF2BD6
const vec3 COLOR_VIOLET  = vec3(0.482, 0.361, 1.0);  // #7B5CFF
const vec3 COLOR_WHITE   = vec3(1.0, 1.0, 1.0);

// Helper smoothstep
float sstep(float edge0, float edge1, float x) {
    return smoothstep(edge0, edge1, clamp(x, edge0, edge1));
}

void main() {
    float cp = clamp(uProgress, 0.0, 1.0);
    
    // 1. Organic morph timing per particle with random seed:
    // Morph window is cp 0.00 - 0.40
    float seedOffset = (aSeed - 0.5) * 0.14;
    float localMorphStart = clamp(0.02 + seedOffset, 0.0, 0.20);
    float localMorphEnd = clamp(0.38 + seedOffset, 0.22, 0.45);
    float morphT = sstep(localMorphStart, localMorphEnd, cp);

    // Initial cloud position
    vec3 cloudPos = position;
    // Add subtle organic breathing to cloud when at hero stage
    if (cp < 0.20) {
        float breathe = sin(uTime * 1.5 + aSeed * 6.28) * 0.035;
        cloudPos += normalize(cloudPos + vec3(0.001)) * breathe;
    }

    // Interpolate from cloud to helix
    vec3 currentPos = mix(cloudPos, aHelixPos, morphT);

    // 2. Descent and spin (cp 0.35 - 1.00)
    float d = sstep(0.35, 1.0, cp);
    float spinAngle = d * uTurns * PI + uTime * 0.08;

    // Rotate about vertical Y axis
    float cosA = cos(spinAngle);
    float sinA = sin(spinAngle);
    vec3 rotatedPos;
    rotatedPos.x = currentPos.x * cosA - currentPos.z * sinA;
    rotatedPos.y = currentPos.y;
    rotatedPos.z = currentPos.x * sinA + currentPos.z * cosA;

    // Camera descent along Y
    float camY = -0.4 - d * (uChainHeight - 0.8);
    vec3 worldPos = rotatedPos;
    worldPos.y -= camY;

    // Project using standard ModelViewProjection
    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Projection Z-Clamp: clamp z to [-0.6, 0.6] as specified to prevent near-side blowup
    float clampedZ = clamp(rotatedPos.z, -0.6, 0.6);
    float perspScale = 1.0 / (1.0 + clampedZ * 0.9);

    // Dynamic point size with shimmer and distance attenuation
    float shimmer = sin(uTime * 3.0 + aSeed * 12.0) * 0.25 + 0.75;
    vShimmer = shimmer;

    float baseSize = aSize * (180.0 * uPixelRatio) * perspScale;
    gl_PointSize = clamp(baseSize / (-mvPosition.z), 1.5, 36.0);

    // Color mapping
    vec3 baseCol = COLOR_VIOLET;
    if (aStrand < 0.5) {
        baseCol = COLOR_CYAN;
    } else if (aStrand < 1.5) {
        baseCol = COLOR_MAGENTA;
    }

    // Add soft bloom highlight to brightest shimmer points
    if (shimmer > 0.85) {
        baseCol = mix(baseCol, COLOR_WHITE, (shimmer - 0.85) * 2.0);
    }

    vColor = baseCol;
    
    // Depth-based alpha fade
    float depthFade = clamp(1.0 - (length(worldPos.xy) / 3.5), 0.35, 1.0);
    vAlpha = depthFade * shimmer;
}

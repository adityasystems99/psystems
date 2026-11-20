precision highp float;

varying vec3 vColor;
varying float vAlpha;

void main() {
    // Coordinate within point sprite centered at (0.5, 0.5)
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
        discard;
    }

    // Soft Gaussian-like circular glow falloff
    float glow = exp(-dist * 4.5);
    float innerCore = smoothstep(0.18, 0.0, dist);

    // Composite core radiance with ambient particle color
    vec3 finalColor = mix(vColor, vec3(1.0), innerCore * 0.45);
    float finalAlpha = glow * vAlpha;

    gl_FragColor = vec4(finalColor, finalAlpha);
}


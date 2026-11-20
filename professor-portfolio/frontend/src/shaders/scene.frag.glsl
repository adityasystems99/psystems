precision highp float;

varying vec3 vColor;
varying float vAlpha;
varying float vShimmer;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
        discard;
    }

    // Soft Gaussian bloom falloff
    float core = smoothstep(0.5, 0.0, dist);
    float bloom = exp(-dist * 4.0);

    vec3 col = vColor;
    float alpha = clamp((bloom * 0.7 + core * 0.3) * vAlpha, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
}

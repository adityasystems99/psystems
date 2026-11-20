export const heroConfig = {
  particles: {
    desktopCount: 4600,
    mobileCount: 2600,
    cloudSpread: { x: 1.8, y: 1.2, z: 0.8 },
  },
  chain: {
    turns: 3,
    height: 2.4,
    helixRadius: 0.6,
    cardRadius: 1.9,
    cardCount: 6,
    strandOffset: Math.PI,
  },
  timeline: {
    phaseASplit: 0.60,
    phaseBStart: 0.56,
    overlapStart: 0.52,
    overlapEnd: 0.66,
    heroFadeEnd: 0.12,
    morphRange: { start: 0.00, end: 0.40 }, // in cp = p / 0.6
    descentRange: { start: 0.35, end: 1.00 }, // in cp
    cardStaggerBase: 0.36,
    cardStaggerStep: 0.07,
    cardStaggerDuration: 0.08,
  },
  captions: {
    range1: { start: 0.40, end: 0.56 },
    range2: { start: 0.66, end: 1.00 },
  }
};

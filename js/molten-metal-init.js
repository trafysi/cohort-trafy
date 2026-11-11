import { initMoltenMetal } from './molten-metal.js';

const container = document.getElementById('moltenMetalBg');

if (container) {
  try {
    initMoltenMetal(container, {
      color1: '#FFF1F6',
      color2: '#F8C8DC',
      color3: '#BDE7E1',
      speed: 0.3,
      scale: 3.4,
      detail: 4,
      glow: 1.6,
      coreSize: 0.1,
      swirl: 0.8,
      fold: -0.2,
      blackPoint: 0.05,
      brightness: 1.3,
      colorMode: 'molten',
      grain: true,
      grainIntensity: 0.04,
      mouseInteraction: true,
      mouseStrength: 0.25,
      opacity: 0.55
    });
  } catch (err) {
    // WebGL2 unsupported or context creation failed; the section's flat
    // background color (already set in CSS) stands in, nothing else to do.
    console.warn('MoltenMetal background unavailable:', err);
  }
}

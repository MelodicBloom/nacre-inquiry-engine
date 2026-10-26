// Deterministic mapping: axis positions (0..1) → material tokens.
// Atlas-aligned axes: hue/temperature, softness, specular, iridescence, depth.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

const MATERIAL_HUES = {
  'abalone shell': 190, 'sea glass': 165, pearl: 300, 'moonlit water': 215, 'gold leaf': 45,
  opal: 280, labradorite: 205, orchid: 315, 'tide-polished stone': 30, lace: 340, obsidian: 260, amber: 35,
};

export function deriveTokens(axes, materials) {
  const ax = (id) => axes[id] ?? 0.5;
  const hues = materials.map((m) => MATERIAL_HUES[m]).filter((h) => h != null);
  const baseHue = hues.length ? hues.reduce((s, h) => s + h, 0) / hues.length : lerp(310, 200, ax('organic_engineered'));
  const softness = clamp(1 - ax('soft_edged_faceted'));            // 1 = blurred edges
  const specular = clamp(1 - ax('glossy_matte'));                   // 1 = catches light
  const iridescence = clamp(lerp(0.15, 1, ax('tactile_spectral')) * lerp(0.6, 1, ax('symbolic_literal') < 0.5 ? 1 : 0.6));
  const mystery = ax('legible_mysterious');
  const warmth = ax('ceremonial_utilitarian') < 0.5 ? 1 - ax('ceremonial_utilitarian') : 0.3;
  const depth = clamp(lerp(0.2, 1, ax('immersive_instrumental') < 0.5 ? 1 - ax('immersive_instrumental') : 0.3));
  const volatility = ax('stable_volatile');
  const sat = Math.round(lerp(28, 70, iridescence));
  const light = Math.round(lerp(94, 70, mystery));
  const hue2 = (baseHue + lerp(40, 140, iridescence)) % 360;
  const hue3 = (baseHue + 300 - lerp(0, 60, warmth)) % 360;
  return {
    color: {
      surface: `hsl(${Math.round(baseHue)} ${Math.round(sat * 0.5)}% ${light}%)`,
      accent: `hsl(${Math.round(hue2)} ${sat}% ${Math.round(light - 22)}%)`,
      sheen: `hsl(${Math.round(hue3)} ${sat}% ${Math.min(97, light + 4)}%)`,
      ink: `hsl(${Math.round(baseHue)} 25% ${mystery > 0.6 ? 14 : 20}%)`,
    },
    radius: Math.round(lerp(4, 40, softness)),
    blur: +(lerp(0, 18, softness)).toFixed(1),
    specular: +specular.toFixed(2),
    iridescence: +iridescence.toFixed(2),
    depth: +depth.toFixed(2),
    motion: { duration: Math.round(lerp(1200, 280, volatility)), easing: volatility > 0.6 ? 'cubic-bezier(.2,.9,.3,1.4)' : 'cubic-bezier(.22,1,.36,1)' },
  };
}

export function tokensToCssVars(t) {
  return {
    '--surface': t.color.surface, '--accent': t.color.accent, '--sheen': t.color.sheen, '--ink': t.color.ink,
    '--radius': `${t.radius}px`, '--blur': `${t.blur}px`, '--specular': t.specular, '--irid': t.iridescence,
    '--depth': t.depth, '--dur': `${t.motion.duration}ms`, '--ease': t.motion.easing,
  };
}

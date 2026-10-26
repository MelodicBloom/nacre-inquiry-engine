import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axisLib from '../axis-library.json';
import bank from '../question-bank.json';
import example from '../example-profile-nacre-gate.json';
import { deriveTokens, tokensToCssVars } from './tokens.js';
import './style.css';

const MATERIALS = ['abalone shell', 'sea glass', 'pearl', 'moonlit water', 'gold leaf', 'opal', 'labradorite', 'orchid', 'tide-polished stone', 'lace', 'obsidian', 'amber'];
const ADAPT = ['rebound', 'dissolve', 'harden', 'bloom', 'ripple', 'fracture', 'adapt', 'freeze', 'yield', 'expand'];
const RHYTHM = ['pulse', 'wave', 'lattice', 'path', 'bloom', 'stutter', 'drift', 'cascade'];
const SYMMETRY = ['radial', 'bilateral', 'asymmetric', 'modular', 'fractal', 'layered'];
const ESSENCE_FIELDS = [
  ['core_metaphor', 'If this were a place, what kind of place would it be?'],
  ['governing_verb', bank.layers.essence[2].q],
  ['governing_noun', bank.layers.essence[3].q],
  ['felt_center', 'What feeling sits at its centre?'],
  ['one_sentence_thesis', bank.layers.essence[0].q],
];
const STEPS = ['Metaphor', 'Polarity', 'Material', 'Profile'];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';

function App() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('My Concept');
  const [essence, setEssence] = useState({ core_metaphor: '', governing_verb: '', governing_noun: '', felt_center: '', one_sentence_thesis: '' });
  const [axes, setAxes] = useState(() => Object.fromEntries(axisLib.axes.map((a) => [a.axis_id, 0.5])));
  const [materials, setMaterials] = useState([]);
  const [adapt, setAdapt] = useState('bloom');
  const [rhythm, setRhythm] = useState('wave');
  const [symmetry, setSymmetry] = useState('bilateral');

  const tokens = useMemo(() => deriveTokens(axes, materials), [axes, materials]);
  const vars = tokensToCssVars(tokens);

  const loadExample = () => {
    const L = example.layers;
    setName(example.entity.name);
    setEssence({ ...L.essence });
    setAxes((p) => ({ ...p, ...Object.fromEntries(L.semantic_axes.map((a) => [a.axis_id, a.position])) }));
    setMaterials(L.symbolism.material_associations.filter((m) => MATERIALS.includes(m)));
    setAdapt(L.behavior.adaptation_style); setRhythm(L.composition.rhythm_type); setSymmetry(L.composition.symmetry_type);
  };

  const profile = useMemo(() => ({
    schema_name: 'DeterministicInquiryEngine', version: '1.0.0',
    entity: { id: slug(name), name, entity_type: 'concept', scope: 'concept', description: essence.one_sentence_thesis },
    metadata: { created_at: new Date().toISOString(), author: 'Nacre Inquiry Engine (web)', inquiry_version: '1.0.0', tags: ['nacre-inquiry', 'web'] },
    layers: {
      essence,
      semantic_axes: axisLib.axes.map((a) => ({ axis_id: a.axis_id, left_pole: a.left_pole, right_pole: a.right_pole, position: +axes[a.axis_id].toFixed(2), confidence: 0.7, evidence: ['web questionnaire'] })),
      negative_definition: { is_not: [], rejects: [], anti_examples: [], failure_modes: [] },
      behavior: { idle_state: '', responsive_state: '', stress_state: '', recovery_state: `ease back over ${tokens.motion.duration}ms`, adaptation_style: adapt },
      symbolism: { archetype: '', lore_role: '', material_associations: materials, symbolic_pairs: [], cultural_resonances: [] },
      composition: { symmetry_type: symmetry, dominant_structure: '', contrast_style: 'light', rhythm_type: rhythm, hierarchy_logic: '' },
      relationships: { allies: [], opposites: [], dependencies: [], bridges: [], container_system: 'Nacre Orchid Atelier design system' },
      implementation_translation: { token_domains: ['color.surface', 'color.accent', 'effect.specular', 'effect.iridescence', 'radius.softness'], component_implications: ['MaterialSurface'], interaction_rules: [], rendering_constraints: ['WebGL with CSS fallback'], documentation_required: [] },
    },
    derived_tokens: tokens,
  }), [name, essence, axes, materials, adapt, rhythm, symmetry, tokens]);

  const download = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${slug(name)}.nacre-profile.json`; a.click();
  };

  return (
    <div className="app" style={vars}>
      <header>
        <p className="eyebrow">Free tool · MelodicBloom · Nacre Inquiry Engine</p>
        <h1>Find your material’s coordinates</h1>
        <p className="lede">Every evocative question here secretly places your idea on a measurable scale. Answer like a poet — get a design-token profile like an engineer.</p>
      </header>
      <div className="layout">
        <section className="panel">
          <nav className="steps">{STEPS.map((s, i) => <button key={s} className={i === step ? 'on' : ''} onClick={() => setStep(i)}>{i + 1}. {s}</button>)}</nav>

          {step === 0 && (<div>
            <p className="learn"><b>Layer 1 — Essence.</b> Metaphor comes first because it constrains everything after: a “threshold” and a “fountain” demand very different motion and light.</p>
            <label>Name your concept<input value={name} onChange={(e) => setName(e.target.value)} /></label>
            {ESSENCE_FIELDS.map(([k, q]) => <label key={k}>{q}<input value={essence[k]} placeholder={example.layers.essence[k]} onChange={(e) => setEssence({ ...essence, [k]: e.target.value })} /></label>)}
            <button className="ghost" onClick={loadExample}>Load the “Nacre Gate” example</button>
          </div>)}

          {step === 1 && (<div>
            <p className="learn"><b>Layer 2 — Polarity.</b> Each slider is a semantic axis. Watch the preview: <i>soft ↔ faceted</i> drives corner softness and blur, <i>glossy ↔ matte</i> drives specular highlight, <i>tactile ↔ spectral</i> drives iridescence.</p>
            {axisLib.axes.map((a) => (
              <div className="axis" key={a.axis_id}>
                <div className="q">{a.question}</div>
                <div className="row"><span>{a.left_pole}</span>
                  <input type="range" min="0" max="1" step="0.01" value={axes[a.axis_id]} onChange={(e) => setAxes({ ...axes, [a.axis_id]: +e.target.value })} />
                  <span>{a.right_pole}</span><code>{axes[a.axis_id].toFixed(2)}</code></div>
                <div className="hint">{axes[a.axis_id] < 0.35 ? a.examples['0.2'] : axes[a.axis_id] > 0.65 ? a.examples['0.8'] : a.examples['0.5']}</div>
              </div>))}
          </div>)}

          {step === 2 && (<div>
            <p className="learn"><b>Layers 4–6 — Material, behavior, composition.</b> {bank.layers.symbolism[1].q} Materials set the base hue family.</p>
            <div className="chips">{MATERIALS.map((m) => <button key={m} className={materials.includes(m) ? 'on' : ''} onClick={() => setMaterials(materials.includes(m) ? materials.filter((x) => x !== m) : [...materials, m])}>{m}</button>)}</div>
            <label>{bank.layers.behavior[3].q}<select value={adapt} onChange={(e) => setAdapt(e.target.value)}>{ADAPT.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>{bank.layers.composition[1].q}<select value={rhythm} onChange={(e) => setRhythm(e.target.value)}>{RHYTHM.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>Symmetry<select value={symmetry} onChange={(e) => setSymmetry(e.target.value)}>{SYMMETRY.map((x) => <option key={x}>{x}</option>)}</select></label>
          </div>)}

          {step === 3 && (<div>
            <p className="learn"><b>Layer 7 — Implementation.</b> Your answers resolve into a schema-shaped profile (<code>deterministic-inquiry.schema.json</code>). Feed it to <code>@nacre/tokens</code> or validate with <code>python evaluate.py</code>.</p>
            <button className="primary" onClick={download}>Download JSON profile</button>
            <pre className="json">{JSON.stringify(profile.layers.semantic_axes.slice(0, 3), null, 1)}…</pre>
          </div>)}

          <div className="nav"><button disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
            {step < 3 ? <button className="primary" onClick={() => setStep(step + 1)}>Next →</button> : <button className="primary" onClick={download}>Export profile</button>}</div>
        </section>

        <aside className="preview">
          <div className={`material rhythm-${rhythm}`}><div className="spec" /><div className="irid" />
            <div className="copy"><small>{essence.governing_verb || 'unfurl'} · {essence.governing_noun || 'threshold'}</small><h2>{name}</h2><p>{essence.core_metaphor || 'Your metaphor appears here.'}</p></div>
          </div>
          <table className="tok"><tbody>
            {Object.entries(tokens.color).map(([k, v]) => <tr key={k}><td><span className="dot" style={{ background: v }} /></td><td>color.{k}</td><td>{v}</td></tr>)}
            <tr><td /><td>softness · radius</td><td>{tokens.radius}px / blur {tokens.blur}px</td></tr>
            <tr><td /><td>specular</td><td>{tokens.specular}</td></tr>
            <tr><td /><td>iridescence</td><td>{tokens.iridescence}</td></tr>
            <tr><td /><td>motion</td><td>{tokens.motion.duration}ms</td></tr>
          </tbody></table>
        </aside>
      </div>
      <footer>Open source · <a href="https://github.com/MelodicBloom/nacre-inquiry-engine">GitHub</a> · powers <a href="https://github.com/MelodicBloom/nacre-orchid-atelier">Nacre Orchid Atelier</a></footer>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />);

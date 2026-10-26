# Nacre Inquiry Engine

> A question machine that thinks like a poet and outputs like an engineer.

A deterministic inquiry schema that discovers properties and positions on semantic axes through metaphor, backwards discovery, Socratic thinking, connections, and creative imagination — then outputs machine-readable profiles that can drive design tokens, component specs, interaction rules, and shader selection.

## What It Does

Most discovery tools go from question to answer. This one goes from question to **coordinate** — and a coordinate can drive a machine.

Every question feels evocative on the surface but secretly places your idea on a measurable scale. The question *"Does this invite approach or command distance?"* feels creative — but its real job is to score your idea on a scale from `intimate` to `monumental` and record that as a usable data point.

## Files

| File | Purpose |
|---|---|
| `deterministic-inquiry.schema.json` | JSON Schema — enforces structure, required fields, enums, and value ranges |
| `axis-library.json` | 15 reusable semantic polarity axes with scoring guidance and examples |
| `question-bank.json` | Full question set, each mapped to a deterministic output field |
| `example-profile-nacre-gate.json` | Completed profile showing all layers resolved for a sample concept |
| `evaluate.py` | Python evaluator — validates profiles, detects contradictions, exports reports |

## Seven Layers

1. **Essence** — What is this at its core? What verb does it always perform?
2. **Polarity** — Where does it sit between opposites? Ceremonial or utilitarian? Revealed or concealed?
3. **What it is not** — What is the most tempting wrong version? What would make it generic?
4. **Behavior** — How does it act when untouched? Under stress? How does it recover?
5. **Symbolism** — What myth, material, or climate does it secretly belong to?
6. **Composition** — Is the beauty in symmetry, tension, or repetition?
7. **Implementation** — Everything above becomes tokens, components, rules, and constraints.

## How to Use

```bash
# Validate a profile and detect contradictions
python evaluate.py --profile example-profile-nacre-gate.json

# Save a report
python evaluate.py --profile your-profile.json --report report.txt
```

1. Pick something you are designing — a system, scene, component, material, or brand.
2. Answer the questions in `question-bank.json`. Each maps to a known field.
3. Score your idea on the axes in `axis-library.json` (0.0 to 1.0 with confidence).
4. Fill in the negative definition — what it is not, what it rejects, how it fails.
5. Run the evaluator to validate and detect contradictions.
6. Use the resolved profile to drive design tokens, component briefs, interaction rules, or shader selection.

## Who It's For

- **Designers** — define what a visual language means before writing a single token
- **Developers** — understand the intent behind a specification
- **Creative directors** — align a team around something that doesn't exist yet
- **AI tools** — generate artifacts that stay true to an aesthetic rather than defaulting to generic

## License

MIT © MelodicBloom

## Interactive questionnaire (web)

A small Vite + React lead-magnet app lives in `src/`. It walks through metaphor → polarity (all 15 axes from `axis-library.json`) → material/behavior/composition, live-previews derived material tokens (colour, softness, specular, iridescence, motion), and exports a schema-shaped JSON profile.

```bash
npm install
npm run dev     # local
npm run build   # → dist/
```

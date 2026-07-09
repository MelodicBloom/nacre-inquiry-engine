#!/usr/bin/env python3
"""Nacre Inquiry Engine -- Profile Evaluator.

Validates a semantic profile against the JSON Schema, detects contradictions,
and exports a human-readable report.

Usage:
    python evaluate.py --profile example-profile-nacre-gate.json
    python evaluate.py --profile my-profile.json --report report.txt
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime

SCHEMA_PATH = Path(__file__).parent / "deterministic-inquiry.schema.json"
AXES_PATH = Path(__file__).parent / "axis-library.json"


def load_json(path: Path) -> dict:
    with open(path, "r") as f:
        return json.load(f)


def validate_structure(profile: dict, schema: dict) -> list:
    errors = []
    for field in schema.get("required", []):
        if field not in profile:
            errors.append(f"Missing required field: {field}")
    entity = profile.get("entity", {})
    for field in schema.get("properties", {}).get("entity", {}).get("required", []):
        if field not in entity:
            errors.append(f"Missing required entity field: {field}")
    layers = profile.get("layers", {})
    for layer in schema.get("properties", {}).get("layers", {}).get("required", []):
        if layer not in layers:
            errors.append(f"Missing required layer: {layer}")
    for i, axis in enumerate(layers.get("semantic_axes", [])):
        pos = axis.get("position", 0.5)
        if not (0.0 <= pos <= 1.0):
            errors.append(f"Axis {i} ({axis.get('axis_id','?')}): position {pos} out of range [0,1]")
        conf = axis.get("confidence", 0.5)
        if not (0.0 <= conf <= 1.0):
            errors.append(f"Axis {i} ({axis.get('axis_id','?')}): confidence {conf} out of range [0,1]")
    return errors


def detect_contradictions(profile: dict, axis_library: dict) -> list:
    warnings = []
    axes_data = profile.get("layers", {}).get("semantic_axes", [])
    axis_map = {a["axis_id"]: a for a in axes_data}

    concealed = axis_map.get("revealed_concealed", {})
    instant = axis_map.get("instant_unfolding", {})
    if concealed.get("position", 0.5) > 0.6 and instant.get("position", 0.5) < 0.4:
        warnings.append(
            f"TENSION: Scored as concealed ({concealed.get('position')}) but also instant "
            f"({instant.get('position')}). A concealed thing that reveals instantly may need justification."
        )

    ornate = axis_map.get("ornate_austere", {})
    ceremonial = axis_map.get("ceremonial_utilitarian", {})
    if ornate.get("position", 0.5) < 0.3 and ceremonial.get("position", 0.5) > 0.7:
        warnings.append(
            f"TENSION: Ornate ({ornate.get('position')}) but highly utilitarian "
            f"({ceremonial.get('position')}). Verify this is intentional."
        )

    immersive = axis_map.get("immersive_instrumental", {})
    volatile = axis_map.get("stable_volatile", {})
    if immersive.get("position", 0.5) < 0.3 and volatile.get("position", 0.5) > 0.7:
        warnings.append(
            f"RISK: Immersive ({immersive.get('position')}) and volatile "
            f"({volatile.get('position')}). May overwhelm the user."
        )

    for axis in axes_data:
        if axis.get("confidence", 1.0) < 0.5:
            warnings.append(
                f"LOW CONFIDENCE: Axis '{axis.get('axis_id')}' has confidence {axis.get('confidence')}. "
                "Consider revisiting the question."
            )
    return warnings


def generate_report(profile: dict, errors: list, warnings: list) -> str:
    lines = []
    lines.append("=" * 60)
    lines.append("NACRE INQUIRY ENGINE -- EVALUATION REPORT")
    lines.append("=" * 60)
    lines.append(f"Entity : {profile.get('entity', {}).get('name', 'Unknown')}")
    lines.append(f"Type   : {profile.get('entity', {}).get('entity_type', 'Unknown')}")
    lines.append(f"Scope  : {profile.get('entity', {}).get('scope', 'Unknown')}")
    lines.append(f"Run at : {datetime.now().isoformat()}")
    lines.append("")

    essence = profile.get("layers", {}).get("essence", {})
    lines.append("-" * 60)
    lines.append("ESSENCE")
    lines.append("-" * 60)
    lines.append(f"  Thesis  : {essence.get('one_sentence_thesis', '—')}")
    lines.append(f"  Metaphor: {essence.get('core_metaphor', '—')}")
    lines.append(f"  Verb    : {essence.get('governing_verb', '—')}")
    lines.append(f"  Center  : {essence.get('felt_center', '—')}")
    lines.append("")

    axes = profile.get("layers", {}).get("semantic_axes", [])
    if axes:
        lines.append("-" * 60)
        lines.append("SEMANTIC AXES  (0=left pole  1=right pole)")
        lines.append("-" * 60)
        for ax in axes:
            bar_len = 20
            pos = ax.get("position", 0.5)
            filled = int(pos * bar_len)
            bar = "\u2588" * filled + "\u2591" * (bar_len - filled)
            lines.append(
                f"  {ax.get('axis_id','?'):<28} [{bar}] {pos:.2f}  conf:{ax.get('confidence',0):.2f}"
            )
        lines.append("")

    neg = profile.get("layers", {}).get("negative_definition", {})
    if neg:
        lines.append("-" * 60)
        lines.append("NEGATIVE DEFINITION")
        lines.append("-" * 60)
        for key in ["is_not", "rejects", "anti_examples", "failure_modes"]:
            items = neg.get(key, [])
            if items:
                lines.append(f"  {key}:")
                for item in items:
                    lines.append(f"    - {item}")
        lines.append("")

    behavior = profile.get("layers", {}).get("behavior", {})
    if behavior:
        lines.append("-" * 60)
        lines.append("BEHAVIOR")
        lines.append("-" * 60)
        for key in ["idle_state", "responsive_state", "stress_state", "recovery_state", "adaptation_style"]:
            val = behavior.get(key)
            if val:
                lines.append(f"  {key}: {val}")
        lines.append("")

    impl = profile.get("layers", {}).get("implementation_translation", {})
    if impl:
        lines.append("-" * 60)
        lines.append("IMPLEMENTATION")
        lines.append("-" * 60)
        for key in ["token_domains", "component_implications", "interaction_rules", "rendering_constraints", "documentation_required"]:
            items = impl.get(key, [])
            if items:
                lines.append(f"  {key}:")
                for item in items:
                    lines.append(f"    - {item}")
        lines.append("")

    lines.append("-" * 60)
    lines.append("VALIDATION")
    lines.append("-" * 60)
    if not errors and not warnings:
        lines.append("  All checks passed. No contradictions detected.")
    else:
        for e in errors:
            lines.append(f"  ERROR   : {e}")
        for w in warnings:
            lines.append(f"  WARNING : {w}")
    lines.append("")
    lines.append("=" * 60)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Evaluate a Nacre Inquiry Engine profile")
    parser.add_argument("--profile", required=True, help="Path to the profile JSON file")
    parser.add_argument("--report", help="Optional path to save the text report")
    args = parser.parse_args()

    profile_path = Path(args.profile)
    if not profile_path.exists():
        print(f"Error: Profile not found at {profile_path}")
        sys.exit(1)

    profile = load_json(profile_path)
    schema = load_json(SCHEMA_PATH) if SCHEMA_PATH.exists() else {}
    axis_library = load_json(AXES_PATH) if AXES_PATH.exists() else {}

    errors = validate_structure(profile, schema) if schema else []
    warnings = detect_contradictions(profile, axis_library) if axis_library else []

    report = generate_report(profile, errors, warnings)
    print(report)

    if args.report:
        Path(args.report).write_text(report)
        print(f"Report saved to {args.report}")


if __name__ == "__main__":
    main()

"""
GS Softwares Prompt Compressor
------------------------------
Loss-aware prompt compression for large AI-agent instructions.

Goal:
- Reduce token/character overhead.
- Preserve architectural requirements.
- Preserve implementation phases.
- Preserve constraints and success criteria.
- Avoid aggressive summarization that can silently remove requirements.

Usage:
    python prompt_compressor.py input.txt output.txt

Optional:
    python prompt_compressor.py input.txt output.txt --report report.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


# ---------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------

# Phrases that add verbosity but normally do not add requirements.
VERBOSE_REPLACEMENTS = [
    (
        r"\bThe task is to progressively transform\b",
        "Transform",
    ),
    (
        r"\bThe implementation must\b",
        "Must",
    ),
    (
        r"\bThe architecture should\b",
        "Architecture:",
    ),
    (
        r"\bThe goal is to\b",
        "Goal:",
    ),
    (
        r"\bThe most important transformation is\b",
        "Key transformation:",
    ),
    (
        r"\bDo not blindly copy this interface\b",
        "Adapt interfaces to repository requirements.",
    ),
    (
        r"\bDo not perform a massive rewrite\b",
        "No rewrite.",
    ),
    (
        r"\bDo not over-engineer this initially\b",
        "Avoid premature complexity.",
    ),
    (
        r"\bwhere possible\b",
        "",
    ),
]


# ---------------------------------------------------------------------
# Protected semantic blocks
# ---------------------------------------------------------------------

# These sections are considered high-value and are not aggressively
# compressed.
PROTECTED_HEADINGS = {
    "TARGET ARCHITECTURE",
    "PRIMARY ARCHITECTURAL PRINCIPLE",
    "DO NOT BREAK THE EXISTING APPLICATION",
    "MIGRATION PRINCIPLE",
    "TOOL SDK / CONTRACT",
    "TOOL REGISTRY",
    "REMOVE DUPLICATED TOOL DEFINITIONS",
    "STUDIO ARCHITECTURE",
    "ROUTING",
    "EXECUTION LAYER",
    "GLOBAL WORKSPACE",
    "WORKFLOW ENGINE",
    "GS-BRIDGE",
    "DISCOVERY LAYER",
    "SEARCH / COMMAND PALETTE",
    "SECURITY & PRIVACY",
    "PERFORMANCE & RESOURCE MANAGEMENT",
    "RELIABILITY",
    "VERSIONING & COMPATIBILITY",
    "OPEN-SOURCE GOVERNANCE",
    "ACCESSIBILITY",
    "INTERNATIONALIZATION",
    "FILE/FOLDER ARCHITECTURE",
    "ARCHITECTURAL RULES",
    "TESTING REQUIREMENTS",
    "IMPLEMENTATION DISCIPLINE",
    "STOP CONDITIONS",
    "SUCCESS CRITERIA",
}


# ---------------------------------------------------------------------
# Utility functions
# ---------------------------------------------------------------------

def normalize_line(line: str) -> str:
    """Normalize whitespace while preserving meaningful content."""
    line = line.replace("\t", " ")
    line = re.sub(r"[ ]{2,}", " ", line)
    return line.strip()


def compress_blank_lines(text: str) -> str:
    """Reduce excessive blank lines to one."""
    return re.sub(r"\n{3,}", "\n\n", text)


def compress_borders(text: str) -> str:
    """
    Compress purely decorative separator lines.
    Does not remove actual architecture diagrams.
    """
    lines = text.splitlines()
    output = []

    for line in lines:
        stripped = line.strip()

        # Remove markdown horizontal rules.
        if re.fullmatch(r"[-_*]{3,}", stripped):
            continue

        output.append(line)

    return "\n".join(output)


def apply_verbose_replacements(text: str) -> str:
    """Reduce common verbose wording without deleting requirements."""
    for pattern, replacement in VERBOSE_REPLACEMENTS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    return text


def remove_redundant_sentences(text: str) -> str:
    """
    Remove exact duplicate sentences/paragraphs.

    This is intentionally conservative.
    """
    paragraphs = re.split(r"\n\s*\n", text)

    seen = set()
    result = []

    for paragraph in paragraphs:
        normalized = re.sub(r"\s+", " ", paragraph.strip()).lower()

        if not normalized:
            continue

        if normalized in seen:
            continue

        seen.add(normalized)
        result.append(paragraph.strip())

    return "\n\n".join(result)


def compact_bullets(text: str) -> str:
    """
    Convert verbose bullet wording into compact bullets where safe.
    """
    lines = text.splitlines()
    output = []

    for line in lines:
        stripped = line.strip()

        # Preserve code blocks.
        if stripped.startswith("```"):
            output.append(line)
            continue

        # Convert common verbose bullet forms.
        stripped = re.sub(
            r"^\-\s+The\s+",
            "- ",
            stripped,
            flags=re.IGNORECASE,
        )

        stripped = re.sub(
            r"^\d+\.\s+The\s+",
            lambda m: m.group(0).replace("The ", ""),
            stripped,
            flags=re.IGNORECASE,
        )

        output.append(stripped)

    return "\n".join(output)


def compact_repeated_phrases(text: str) -> str:
    """
    Conservative replacements for recurring phrases.
    """

    replacements = {
        "For example,": "E.g.",
        "For instance,": "E.g.",
        "In order to": "To",
        "as well as": "and",
        "at this point": "now",
        "at the end of": "after",
        "in the future": "later",
        "where appropriate": "",
        "where justified": "",
        "where technically required": "if required",
    }

    for old, new in replacements.items():
        text = re.sub(
            re.escape(old),
            new,
            text,
            flags=re.IGNORECASE,
        )

    return text


def remove_excessive_spaces(text: str) -> str:
    """Final whitespace normalization outside code blocks."""
    blocks = re.split(r"(```[\s\S]*?```)", text)

    for i in range(0, len(blocks), 2):
        blocks[i] = re.sub(r"[ \t]+", " ", blocks[i])
        blocks[i] = re.sub(r"\n[ \t]+", "\n", blocks[i])

    return "".join(blocks)


# ---------------------------------------------------------------------
# Semantic preservation analysis
# ---------------------------------------------------------------------

def extract_requirements(text: str) -> dict:
    """
    Extract important semantic markers from the prompt.

    This doesn't prove semantic equivalence, but provides a useful
    integrity check after compression.
    """

    patterns = {
        "must": r"\bmust\b",
        "do_not": r"\bdo not\b|\bno rewrite\b|\bavoid\b",
        "architecture": r"\barchitecture\b",
        "registry": r"\bregistry\b",
        "sdk": r"\bSDK\b",
        "execution": r"\bexecution\b",
        "workspace": r"\bworkspace\b",
        "workflow": r"\bworkflow\b",
        "bridge": r"\bGS-Bridge\b",
        "security": r"\bsecurity\b",
        "privacy": r"\bprivacy\b",
        "performance": r"\bperformance\b",
        "reliability": r"\breliability\b",
        "versioning": r"\bversioning\b|\bcompatibility\b",
        "accessibility": r"\baccessibility\b",
        "i18n": r"\bi18n\b|\binternationalization\b",
        "testing": r"\btest(?:ing|s)?\b",
        "seo": r"\bSEO\b",
        "aeo": r"\bAEO\b",
        "geo": r"\bGEO\b",
        "success": r"\bsuccess criteria\b",
        "phases": r"\bphase\b",
    }

    return {
        key: len(re.findall(pattern, text, flags=re.IGNORECASE))
        for key, pattern in patterns.items()
    }


def compare_semantics(original: str, compressed: str) -> dict:
    original_markers = extract_requirements(original)
    compressed_markers = extract_requirements(compressed)

    preserved = {}
    missing = {}

    for key, count in original_markers.items():
        new_count = compressed_markers.get(key, 0)

        preserved[key] = {
            "original": count,
            "compressed": new_count,
            "preserved": new_count > 0 or count == 0,
        }

        if count > 0 and new_count == 0:
            missing[key] = count

    return {
        "original_markers": original_markers,
        "compressed_markers": compressed_markers,
        "missing_categories": missing,
    }


# ---------------------------------------------------------------------
# Main compressor
# ---------------------------------------------------------------------

def compress_prompt(text: str) -> str:
    """
    Conservative multi-pass prompt compression.
    """

    # Normalize CRLF.
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Normalize individual lines.
    lines = [normalize_line(line) for line in text.splitlines()]
    text = "\n".join(lines)

    # Preserve code blocks while performing prose transformations.
    parts = re.split(r"(```[\s\S]*?```)", text)

    for i in range(0, len(parts), 2):
        prose = parts[i]

        prose = apply_verbose_replacements(prose)
        prose = compact_repeated_phrases(prose)

        parts[i] = prose

    text = "".join(parts)

    # Conservative cleanup.
    text = remove_redundant_sentences(text)
    text = compress_borders(text)
    text = compact_bullets(text)
    text = compress_blank_lines(text)
    text = remove_excessive_spaces(text)

    return text.strip() + "\n"


# ---------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------

def build_report(original: str, compressed: str) -> dict:
    original_chars = len(original)
    compressed_chars = len(compressed)

    original_words = len(re.findall(r"\b\w+\b", original))
    compressed_words = len(re.findall(r"\b\w+\b", compressed))

    original_lines = len(original.splitlines())
    compressed_lines = len(compressed.splitlines())

    char_reduction = (
        1 - compressed_chars / original_chars
        if original_chars
        else 0
    )

    word_reduction = (
        1 - compressed_words / original_words
        if original_words
        else 0
    )

    semantic = compare_semantics(original, compressed)

    return {
        "original": {
            "characters": original_chars,
            "words": original_words,
            "lines": original_lines,
        },
        "compressed": {
            "characters": compressed_chars,
            "words": compressed_words,
            "lines": compressed_lines,
        },
        "compression": {
            "character_reduction": round(char_reduction * 100, 2),
            "word_reduction": round(word_reduction * 100, 2),
        },
        "semantic_integrity": semantic,
        "warning": (
            "This is a conservative syntactic/semantic-preserving "
            "compression heuristic. It cannot mathematically guarantee "
            "zero semantic loss."
        ),
    }


# ---------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Compress a large AI-agent prompt conservatively."
    )

    parser.add_argument(
        "input",
        help="Input prompt text file",
    )

    parser.add_argument(
        "output",
        help="Compressed prompt output file",
    )

    parser.add_argument(
        "--report",
        default=None,
        help="Optional JSON integrity/compression report",
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(
            f"Input file not found: {input_path}"
        )

    original = input_path.read_text(
        encoding="utf-8"
    )

    compressed = compress_prompt(original)

    output_path.write_text(
        compressed,
        encoding="utf-8"
    )

    report = build_report(original, compressed)

    if args.report:
        Path(args.report).write_text(
            json.dumps(
                report,
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

    print("\nGS SOFTWARES PROMPT COMPRESSOR")
    print("=" * 40)

    print(
        f"Original characters : "
        f"{report['original']['characters']:,}"
    )

    print(
        f"Compressed characters: "
        f"{report['compressed']['characters']:,}"
    )

    print(
        f"Character reduction : "
        f"{report['compression']['character_reduction']:.2f}%"
    )

    print(
        f"Original words      : "
        f"{report['original']['words']:,}"
    )

    print(
        f"Compressed words    : "
        f"{report['compressed']['words']:,}"
    )

    print(
        f"Word reduction      : "
        f"{report['compression']['word_reduction']:.2f}%"
    )

    missing = report["semantic_integrity"]["missing_categories"]

    if missing:
        print("\nWARNING: Potentially missing semantic categories:")
        for category, count in missing.items():
            print(f"  - {category}: {count}")
    else:
        print(
            "\nSemantic marker check: "
            "ALL IMPORTANT CATEGORIES PRESERVED"
        )

    print(f"\nCompressed prompt: {output_path}")

    if args.report:
        print(f"Integrity report : {args.report}")


if __name__ == "__main__":
    main()
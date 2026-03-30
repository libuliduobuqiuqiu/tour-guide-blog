#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import re
import sys


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS_DIR = REPO_ROOT / "docs"
OUTPUT_PATH = REPO_ROOT / "CHANGELOG.md"


def extract_date(path: pathlib.Path, content: str) -> str:
    match = re.search(r"^Date:\s*(.+?)\s*$", content, re.MULTILINE)
    if match:
        return match.group(1).strip()

    match = re.search(r"(\d{4}-\d{2}-\d{2})", path.name)
    if match:
        return match.group(1)

    return "Unknown Date"


def strip_preamble(content: str) -> str:
    lines = content.splitlines()
    start = 0
    while start < len(lines) and (
        lines[start].startswith("# ")
        or lines[start].startswith("Date:")
        or lines[start].startswith("Branch:")
        or lines[start].strip() == ""
    ):
        start += 1
    return "\n".join(lines[start:]).strip()


def collect_commit_logs() -> list[tuple[str, pathlib.Path, str]]:
    docs = sorted(DOCS_DIR.glob("commit-log-*.md"), reverse=True)
    entries: list[tuple[str, pathlib.Path, str]] = []
    for path in docs:
        content = path.read_text(encoding="utf-8").strip()
        if not content:
            continue
        entries.append((extract_date(path, content), path, strip_preamble(content)))
    return entries


def render(entries: list[tuple[str, pathlib.Path, str]]) -> str:
    lines = [
        "# Changelog",
        "",
        "This file is generated from the commit log documents in `docs/commit-log-*.md`.",
        "The format is intentionally close to Keep a Changelog: chronological releases with human-written change summaries.",
        "",
    ]

    for date, path, body in entries:
        lines.append(f"## {date}")
        lines.append("")
        lines.append(f"Source: `docs/{path.name}`")
        lines.append("")
        lines.append(body)
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    entries = collect_commit_logs()
    if not entries:
        print("No commit log files found under docs/commit-log-*.md", file=sys.stderr)
        return 1

    OUTPUT_PATH.write_text(render(entries), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

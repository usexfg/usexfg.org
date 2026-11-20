#!/usr/bin/env python3
"""
Routine SEO / GEO / AEO chores for usexfg.org (static site).

- Syncs sitemap.xml <lastmod> from git history for mapped local pages.
- Validates crawl/index basics: sitemap <-> files, robots sitemap line, llms presence.
- Validates per-page essentials: lang, title, meta description, canonical, h1, JSON-LD parse.
- Checks local href/src targets exist (basic).

Exit non-zero on validation errors. Writes sitemap in-place when dates change.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://usexfg.org"

INDEXABLE = ["index.html", "answers.html", "parked-capital.html"]
SITEMAP_PATH = ROOT / "sitemap.xml"
ROBOTS_PATH = ROOT / "robots.txt"
LLMS_PATH = ROOT / "llms.txt"


def git_lastmod(path: Path) -> str | None:
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%cs", "--", str(path.relative_to(ROOT))],
            cwd=ROOT,
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        return out or None
    except Exception:
        return None


def loc_to_file(loc: str) -> Path | None:
    loc = loc.strip()
    if not loc.startswith(SITE):
        return None
    p = urlparse(loc).path
    if p in ("", "/"):
        return ROOT / "index.html"
    return ROOT / p.lstrip("/")


def sync_sitemap_lastmod() -> tuple[bool, list[str]]:
    errors: list[str] = []
    if not SITEMAP_PATH.exists():
        return False, ["sitemap.xml missing"]
    text = SITEMAP_PATH.read_text(encoding="utf-8")
    changed = False

    def repl(m: re.Match) -> str:
        nonlocal changed
        block = m.group(0)
        loc_m = re.search(r"<loc>(.*?)</loc>", block)
        if not loc_m:
            return block
        loc = loc_m.group(1).strip()
        f = loc_to_file(loc)
        if not f or not f.exists():
            errors.append(f"sitemap loc has no local file: {loc}")
            return block
        lm = git_lastmod(f)
        if not lm:
            return block
        if re.search(r"<lastmod>.*?</lastmod>", block):
            new_block = re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{lm}</lastmod>", block)
        else:
            new_block = block.replace(f"<loc>{loc}</loc>", f"<loc>{loc}</loc>\n    <lastmod>{lm}</lastmod>")
        if new_block != block:
            changed = True
        return new_block

    new_text = re.sub(r"<url>.*?</url>", repl, text, flags=re.DOTALL)
    if changed:
        SITEMAP_PATH.write_text(new_text, encoding="utf-8")
    return changed, errors


class PageCheck(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.lang_ok = False
        self.in_title = False
        self.title = ""
        self.meta_desc = False
        self.canonical = None
        self.h1_count = 0
        self.in_h1 = False
        self.h1_text = ""
        self.jsonld: list[str] = []
        self.in_jsonld = False
        self.jsonld_buf: list[str] = []
        self.local_refs: list[tuple[str, int]] = []

    def handle_starttag(self, tag: str, attrs):
        d = dict(attrs)
        if tag == "html" and d.get("lang"):
            self.lang_ok = True
        if tag == "title":
            self.in_title = True
        if tag == "meta" and d.get("name", "").lower() == "description" and d.get("content"):
            self.meta_desc = True
        if tag == "link" and d.get("rel") == "canonical" and d.get("href"):
            self.canonical = d["href"]
        if tag == "h1":
            self.h1_count += 1
            self.in_h1 = True
        if tag == "script" and d.get("type") == "application/ld+json":
            self.in_jsonld = True
            self.jsonld_buf = []
        for attr in ("href", "src"):
            v = d.get(attr)
            if v:
                self.local_refs.append((v, self.getpos()[0]))

    def handle_endtag(self, tag: str):
        if tag == "title":
            self.in_title = False
        if tag == "h1":
            self.in_h1 = False
        if tag == "script" and self.in_jsonld:
            self.in_jsonld = False
            self.jsonld.append("".join(self.jsonld_buf))

    def handle_data(self, data: str):
        if self.in_title:
            self.title += data
        if self.in_h1:
            self.h1_text += data
        if self.in_jsonld:
            self.jsonld_buf.append(data)


def is_local_ref(ref: str) -> bool:
    if not ref or ref.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        return False
    u = urlparse(ref)
    if u.scheme in ("http", "https"):
        # allow same-site absolute as local file check? skip for simplicity
        return u.netloc in ("usexfg.org", "www.usexfg.org")
    return u.scheme == ""


def ref_to_path(page: Path, ref: str) -> Path | None:
    u = urlparse(ref)
    path = u.path
    if not path:
        return None
    if u.netloc in ("usexfg.org", "www.usexfg.org"):
        if path in ("", "/"):
            return ROOT / "index.html"
        return ROOT / path.lstrip("/")
    if path.startswith("/"):
        return ROOT / path.lstrip("/")
    return (page.parent / path).resolve()


def validate_pages() -> list[str]:
    errors: list[str] = []
    for name in INDEXABLE:
        p = ROOT / name
        if not p.exists():
            errors.append(f"missing indexed page: {name}")
            continue
        parser = PageCheck()
        try:
            parser.feed(p.read_text(encoding="utf-8"))
        except Exception as e:
            errors.append(f"{name}: HTML parse error: {e}")
            continue
        if not parser.lang_ok:
            errors.append(f"{name}: missing <html lang=...>")
        if not parser.title.strip():
            errors.append(f"{name}: missing/empty <title>")
        if not parser.meta_desc:
            errors.append(f"{name}: missing meta description")
        if not parser.canonical:
            errors.append(f"{name}: missing canonical link")
        if parser.h1_count < 1:
            errors.append(f"{name}: missing <h1>")
        for i, block in enumerate(parser.jsonld, 1):
            try:
                json.loads(block)
            except Exception as e:
                errors.append(f"{name}: invalid JSON-LD block {i}: {e}")
        # local refs
        for ref, line in parser.local_refs:
            if not is_local_ref(ref):
                continue
            tp = ref_to_path(p, ref)
            if tp is None:
                continue
            try:
                tp_rel = tp.relative_to(ROOT.resolve())
            except Exception:
                continue
            # allow anchors to same page file existence; ignore pure fragment-only handled above
            target = ROOT / tp_rel
            # strip nothing; path may include .. normalized; ensure within root and exists
            if not str(target).startswith(str(ROOT)):
                continue
            if not target.exists():
                errors.append(f"{name}:{line}: missing local target {ref}")
    return errors


def validate_global() -> list[str]:
    errors: list[str] = []
    if not ROBOTS_PATH.exists():
        errors.append("robots.txt missing")
    else:
        rtxt = ROBOTS_PATH.read_text(encoding="utf-8")
        if "Sitemap:" not in rtxt:
            errors.append("robots.txt missing Sitemap directive")
        if f"Sitemap: {SITE}/sitemap.xml" not in rtxt and "sitemap.xml" not in rtxt:
            errors.append("robots.txt does not reference sitemap.xml")
    if not LLMS_PATH.exists():
        errors.append("llms.txt missing")
    else:
        ltxt = LLMS_PATH.read_text(encoding="utf-8")
        for must in (SITE, "answers.html", "fuego-suite"):
            if must not in ltxt:
                errors.append(f"llms.txt missing expected content: {must}")
    if not SITEMAP_PATH.exists():
        errors.append("sitemap.xml missing")
    return errors


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-sync", action="store_true", help="Do not write sitemap lastmod updates")
    args = ap.parse_args()

    errors: list[str] = []
    changed = False
    if not args.no_sync:
        changed, e = sync_sitemap_lastmod()
        errors.extend(e)
    errors.extend(validate_global())
    errors.extend(validate_pages())

    if changed:
        print("sitemap.xml: updated <lastmod> values")
    if errors:
        print(f"SEO/AEO chores: {len(errors)} issue(s)", file=sys.stderr)
        for e in errors:
            print(f"- {e}", file=sys.stderr)
        return 1
    print("SEO/AEO chores: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

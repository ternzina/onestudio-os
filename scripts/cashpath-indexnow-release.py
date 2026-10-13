#!/usr/bin/env python3
"""CashPath-only post-deployment IndexNow notifications. Python stdlib only.

Public GETs, no cookies or protection bypass. State is durable in GitHub issue
#38. The workflow serializes all runs. A changed batch is checkpointed BEFORE
POST; an ambiguous timeout stops rather than silently resubmitting it.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Callable

HOST = "cashpath.org"
ORIGIN = "https://" + HOST
REPO = "ternzina/onestudio-os"
PROJECT = "prj_FHof1waLZckf0uSKH0bz5cX5VpLL"
LEDGER_ISSUE = 38
RELEASE_URL = ORIGIN + "/api/public/cashpath-indexnow-release"
INDEXNOW_URL = "https://api.indexnow.org/indexnow"
STATE_START = "<!-- cashpath-indexnow-state:v1 -->"
STATE_END = "<!-- /cashpath-indexnow-state -->"
MAX_PAGES = 500
MAX_BATCH = 100
MAX_HTML = 10 * 1024 * 1024
KEY_RE = re.compile(r"^[A-Za-z0-9-]{8,128}$")
SHA_RE = re.compile(r"^[0-9a-f]{40}$")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                    separators=(",", ":")).encode()).hexdigest()


def canonical_url(url: str) -> str:
    """Never send other tenants, query strings, preview URLs or credentials."""
    p = urllib.parse.urlsplit(url)
    if (p.scheme != "https" or p.netloc != HOST or p.query or p.fragment or
            p.username or p.password or not re.fullmatch(r"/(?:p/[a-z0-9]+(?:[-/][a-z0-9]+)*)?", p.path or "/")):
        raise ValueError("URL outside the CashPath canonical public-page allowlist")
    return ORIGIN + (p.path or "/")


def parse_sitemap(xml: str) -> list[str]:
    if "<!DOCTYPE" in xml.upper() or "<!ENTITY" in xml.upper():
        raise ValueError("Unsupported XML declarations")
    root = ET.fromstring(xml)
    if root.tag.rsplit("}", 1)[-1] != "urlset":
        raise ValueError("Expected the CashPath URL sitemap, not a sitemap index")
    urls = sorted({canonical_url((e.text or "").strip()) for e in root.iter()
                   if e.tag.rsplit("}", 1)[-1] == "loc"})
    if not urls or len(urls) > MAX_PAGES:
        raise ValueError("Sitemap empty or above the safety limit")
    return urls


class PageFacts(HTMLParser):
    """Hash visible copy, content links, SEO metadata and real JSON-LD only.

    RSC/JS, style classes, build/chunk IDs and resource preloads are excluded.
    A code-only deploy must not make every unchanged article look modified.
    """
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.body = False
        self.title = False
        self.ignored = None
        self.script_type = ""
        self.script_text = []
        self.text = []
        self.titles = []
        self.links = []
        self.meta = []
        self.schema = []
        self.canonicals = []
        self.robots = []
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.ignored:
            return
        if tag in ("script", "style", "template"):
            self.ignored = tag
            self.script_type = a.get("type", "").lower()
            self.script_text = []
            return
        if tag == "body": self.body = True
        if tag == "title": self.title = True
        if tag == "h1" and self.body: self.h1 += 1
        if tag == "meta":
            name = (a.get("name") or a.get("property") or "").lower()
            if name in ("description", "robots", "bingbot", "googlebot", "keywords") or name.startswith(("og:", "twitter:")):
                self.meta.append([name, a.get("content", "")])
            if name in ("robots", "bingbot"):
                self.robots.append(a.get("content", ""))
        if tag == "link":
            rel = a.get("rel", "").lower().split()
            if "canonical" in rel:
                self.canonicals.append(a.get("href", ""))
            if "alternate" in rel and a.get("hreflang"):
                self.meta.append(["alternate:" + a["hreflang"], a.get("href", "")])
        if self.body and tag == "a" and "href" in a:
            self.links.append(["link", a["href"]])
        if self.body and tag == "img":
            self.links.append(["image", a.get("src", ""), a.get("alt", "")])

    def handle_endtag(self, tag):
        if self.ignored:
            if tag == self.ignored:
                if tag == "script" and self.script_type == "application/ld+json":
                    self.schema.append(json.loads("".join(self.script_text)))
                self.ignored = None
            return
        if tag == "body": self.body = False
        if tag == "title": self.title = False

    def handle_data(self, data):
        if self.ignored:
            if self.ignored == "script" and self.script_type == "application/ld+json":
                self.script_text.append(data)
            return
        if self.title: self.titles.append(data)
        if self.body: self.text.append(data)

    def fingerprint(self, url: str, xrobots: str = "") -> str:
        if len(self.canonicals) != 1 or canonical_url(self.canonicals[0]) != canonical_url(url):
            raise ValueError("Missing, duplicate or incorrect self-canonical")
        if re.search(r"\b(?:noindex|none)\b", " ".join(self.robots + [xrobots]), re.I):
            raise ValueError("Page forbids indexing")
        if self.h1 != 1 or not self.titles or len("".join(self.text).strip()) < 50:
            raise ValueError("Page content not complete")
        return digest({"title": " ".join("".join(self.titles).split()),
                       "text": " ".join(" ".join(self.text).split()),
                       "links": self.links, "meta": sorted(self.meta),
                       "schema": self.schema, "canonical": canonical_url(url)})


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(url: str, method="GET", payload=None, token=None, max_bytes=MAX_HTML):
    """Only GitHub calls receive authorization; it can never follow a redirect."""
    p = urllib.parse.urlsplit(url)
    if p.scheme != "https" or p.netloc not in (HOST, "api.github.com", "api.indexnow.org"):
        raise ValueError("Network destination not allowed")
    headers = {"User-Agent": "CashPath-IndexNow-Automation/1.0", "Accept-Encoding": "identity"}
    if token:
        if p.netloc != "api.github.com": raise ValueError("Refusing to leak GitHub credentials")
        headers.update({"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28"})
    data = None
    if payload is not None:
        data = json.dumps(payload, separators=(",", ":")).encode()
        headers["Content-Type"] = "application/json; charset=utf-8"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    opener = urllib.request.build_opener(NoRedirect())
    try:
        response = opener.open(req, timeout=20)
    except urllib.error.HTTPError as e:
        response = e
    with response:
        raw = response.read(max_bytes + 1)
        if len(raw) > max_bytes: raise ValueError("HTTP response exceeds safety limit")
        return response.code, dict((k.lower(), v) for k, v in response.headers.items()), raw.decode("utf-8", "replace")


def public_get(url: str, tries=3):
    for attempt in range(tries):
        try:
            result = request(url)
            if result[0] not in (404, 408, 429, 500, 502, 503, 504) or attempt == tries - 1:
                return result
        except (urllib.error.URLError, TimeoutError, OSError):
            if attempt == tries - 1: raise RuntimeError("Public GET failed") from None
        time.sleep(2 * (attempt + 1))
    raise RuntimeError("Public GET exhausted")


def validate_release(data: dict, expected: str | None = None):
    if (data.get("version") != 1 or data.get("host") != HOST or data.get("projectId") != PROJECT or
        data.get("environment") != "production" or not SHA_RE.fullmatch(data.get("commit", "")) or
        not re.fullmatch(r"[a-z0-9-]+\.vercel\.app", data.get("deployment", ""))):
        raise ValueError("Not a verified CashPath production release")
    if expected and data["commit"] != expected: raise ValueError("Requested commit is not serving CashPath yet")
    if data.get("sitemapUrl") != ORIGIN + "/sitemap.xml": raise ValueError("Wrong sitemap host")
    loc = urllib.parse.urlsplit(data.get("keyLocation", ""))
    if loc.scheme != "https" or loc.netloc != HOST or loc.query or loc.fragment:
        raise ValueError("Invalid public verification-file location")
    key = loc.path[1:-4] if loc.path.endswith(".txt") else ""
    if not KEY_RE.fullmatch(key): raise ValueError("Invalid verification filename")
    return key


def expected_release(event_name: str, event: dict) -> str | None:
    """None means ignore. Every accepted event must still pass the live gate."""
    if event_name == "push":
        sha = event.get("after", "") if event.get("ref") == "refs/heads/main" else ""
    elif event_name == "deployment_status":
        d, s = event.get("deployment", {}), event.get("deployment_status", {})
        production = d.get("production_environment") is True or str(d.get("environment", "")).lower() == "production"
        sha = d.get("sha", "") if s.get("state") == "success" and production and d.get("ref") in ("main", d.get("sha")) else ""
    elif event_name == "repository_dispatch":
        p = event.get("client_payload", {})
        project = p.get("project", {})
        pid = project.get("id") if isinstance(project, dict) else project
        sha = p.get("git", {}).get("sha", "")
        if pid != PROJECT or p.get("environment") != "production": return None
    elif event_name == "workflow_dispatch":
        return "current"
    else:
        return None
    return sha if SHA_RE.fullmatch(sha) else None


def parse_state(body: str) -> dict:
    pat = re.escape(STATE_START) + r"\s*```json\s*(.*?)\s*```\s*" + re.escape(STATE_END)
    m = re.search(pat, body, re.S)
    if not m: raise ValueError("Ledger state missing; refusing to resend the library")
    state = json.loads(m[1])
    if state.get("version") != 1 or state.get("host") != HOST or not isinstance(state.get("pages"), dict):
        raise ValueError("Ledger schema mismatch")
    for path, h in state["pages"].items():
        canonical_url(ORIGIN + path)
        if not re.fullmatch(r"[0-9a-f]{64}", h): raise ValueError("Invalid stored fingerprint")
    return state


def state_body(body: str, state: dict) -> str:
    parse_state(body)
    replacement = STATE_START + "\n```json\n" + json.dumps(state, sort_keys=True, separators=(",", ":")) + "\n```\n" + STATE_END
    first, rest = body.split(STATE_START, 1)
    _, last = rest.split(STATE_END, 1)
    result = first + replacement + last
    if len(result.encode()) > 60000: raise ValueError("Ledger checkpoint exceeds the issue size safety limit")
    return result


class Ledger:
    def __init__(self, token: str):
        self.token = token
        self.endpoint = f"https://api.github.com/repos/{REPO}/issues/{LEDGER_ISSUE}"
        self.body = ""
        self.paused = False

    def api(self, url, method="GET", payload=None):
        status, _, body = request(url, method, payload, self.token)
        if not 200 <= status < 300:
            raise RuntimeError(f"GitHub ledger {method} failed with HTTP {status}")
        return json.loads(body) if body else {}

    def load(self):
        issue = self.api(self.endpoint)
        self.paused = issue.get("state") != "open"
        self.body = issue["body"]
        return parse_state(self.body)

    def save(self, state):
        self.body = state_body(self.body, state)
        self.api(self.endpoint, "PATCH", {"body": self.body})

    def note(self, report):
        text = "### CashPath IndexNow: " + report["result"] + "\n\n```json\n" + json.dumps(report, indent=2, sort_keys=True) + "\n```"
        self.api(self.endpoint + "/comments", "POST", {"body": text})


def changed_pages(previous: dict, snapshot: dict):
    return {p: h for p, h in snapshot.items() if previous.get(p) != h}


def reconcile(state: dict, snapshot: dict, release: str, save: Callable, send: Callable):
    """Pure orchestration with injected persistence/POST for regression tests."""
    state = copy.deepcopy(state)
    if state.get("pending"):
        raise RuntimeError("Previous POST outcome unresolved. Inspect the ledger before retrying; no duplicate sent")
    if not state.get("initialized"):
        state.update(initialized=True, lastRelease=release, pages=snapshot, pending=None, updatedAt=utc_now())
        save(state)
        return {"result": "baseline_initialized", "urlCount": 0, "baselinePages": len(snapshot), "receipts": []}
    changed = changed_pages(state["pages"], snapshot)
    receipts = []
    pairs = sorted(changed.items())
    for start in range(0, len(pairs), MAX_BATCH):
        batch = dict(pairs[start:start + MAX_BATCH])
        urls = [canonical_url(ORIGIN + p) for p in batch]
        pending = {"release": release, "batchId": digest([release, batch]), "urls": urls, "requestedAt": utc_now()}
        state["pending"] = pending
        save(state)
        try:
            status = send(urls)
        except Exception:
            raise RuntimeError("IndexNow outcome unknown; pending batch retained, no automatic duplicate") from None
        if status not in (200, 202):
            state["pending"] = None
            state["lastError"] = {"httpStatus": status, "release": release, "at": utc_now()}
            save(state)
            raise RuntimeError(f"IndexNow rejected batch with HTTP {status}; checkpoint not advanced")
        receipt = {**pending, "httpStatus": status, "receivedAt": utc_now(),
                   "status": "accepted" if status == 200 else "accepted_pending_key_validation"}
        state["pages"].update(batch)
        state["pending"] = None
        state["lastReceipt"] = receipt
        state.pop("lastError", None)
        save(state)
        receipts.append(receipt)
    # Sitemap removal alone is not proof that the page was actually deleted.
    state["lastRelease"] = release
    state["updatedAt"] = utc_now()
    save(state)
    return {"result": "accepted" if receipts else "no_content_changes", "urlCount": len(changed),
            "receipts": receipts, "removedFromSitemap": sorted(set(state["pages"]) - set(snapshot))}


def snapshot_pages(urls):
    def scan(url):
        status, headers, html = public_get(url)
        if status != 200 or "location" in headers or "text/html" not in headers.get("content-type", ""):
            raise RuntimeError(f"Public page check failed: {url} (HTTP {status})")
        facts = PageFacts()
        facts.feed(html)
        h = facts.fingerprint(url, headers.get("x-robots-tag", ""))
        time.sleep(0.6)
        return urllib.parse.urlsplit(url).path or "/", h
    with ThreadPoolExecutor(max_workers=2) as pool:
        return dict(pool.map(scan, urls))


def report_output(report):
    Path("cashpath-indexnow-result.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write("## CashPath IndexNow\n```json\n" + json.dumps(report, indent=2) + "\n```\n")


def run(args):
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    event = json.loads(Path(event_path).read_text()) if event_path else {}
    name = os.environ.get("GITHUB_EVENT_NAME", "workflow_dispatch")
    if os.environ.get("GITHUB_REPOSITORY", REPO) != REPO:
        raise ValueError("Workflow is restricted to the authorized repository")
    expected = expected_release(name, event)
    if expected is None:
        return {"result": "skipped_nonproduction_event", "urlCount": 0}
    token = os.environ.get("GITHUB_TOKEN")
    if not token: raise ValueError("GitHub Actions token unavailable")
    ledger = Ledger(token)
    state = ledger.load()
    if ledger.paused: return {"result": "paused_by_closed_ledger", "urlCount": 0}
    if state.get("pending"): raise RuntimeError("Ledger has unresolved POST; manual receipt review required")
    deadline = time.monotonic() + args.wait_seconds
    release = None
    while time.monotonic() < deadline:
        try:
            status, _, body = public_get(RELEASE_URL, tries=1)
            if status == 200:
                data = json.loads(body)
                validate_release(data, None if expected == "current" else expected)
                release = data
                break
        except (ValueError, RuntimeError, json.JSONDecodeError):
            pass
        if expected != "current":
            current = ledger.api(f"https://api.github.com/repos/{REPO}/git/ref/heads/main")["object"]["sha"]
            if current != expected:
                return {"result": "superseded_release", "urlCount": 0, "requestedRelease": expected}
        time.sleep(15)
    if not release: raise RuntimeError("Production release did not become available; no URLs sent")
    if (state.get("lastRelease") == release["commit"] and
            state.get("lastDeployment") == release["deployment"] and not args.dry_run):
        return {"result": "release_already_processed", "release": release["commit"], "urlCount": 0}
    key = validate_release(release)
    status, headers, text = public_get(release["keyLocation"])
    if status != 200 or "location" in headers or text.strip() != key:
        raise RuntimeError("Public key-file verification failed")
    status, _, xml = public_get(release["sitemapUrl"])
    if status != 200: raise RuntimeError("Public sitemap unavailable")
    urls = parse_sitemap(xml)
    snapshot = snapshot_pages(urls)
    status, _, body = public_get(RELEASE_URL, tries=1)
    if status != 200: raise RuntimeError("Release changed during scan")
    validate_release(json.loads(body), release["commit"])
    if args.dry_run:
        return {"result": "dry_run", "release": release["commit"], "publicPagesChecked": len(snapshot),
                "wouldSubmit": [ORIGIN + p for p in changed_pages(state["pages"], snapshot)] if state.get("initialized") else [],
                "baselineRequired": not state.get("initialized"), "urlCount": 0}

    def send(changed):
        code, _, identity = public_get(RELEASE_URL, tries=1)
        if code != 200: raise RuntimeError("Release identity unavailable before POST")
        validate_release(json.loads(identity), release["commit"])
        code, _, _ = request(INDEXNOW_URL, "POST", {"host": HOST, "key": key, "urlList": changed}, max_bytes=65536)
        return code

    def save_checkpoint(value):
        value["lastDeployment"] = release["deployment"]
        ledger.save(value)

    result = reconcile(state, snapshot, release["commit"], save_checkpoint, send)
    result.update(host=HOST, release=release["commit"], at=utc_now(), publicPagesChecked=len(snapshot),
                  runUrl=f"https://github.com/{REPO}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}")
    ledger.note(result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="GETs only; no ledger write or submission")
    parser.add_argument("--wait-seconds", type=int, default=1200)
    args = parser.parse_args()
    try:
        report_output(run(args))
    except Exception as e:
        report_output({"result": "failed", "at": utc_now(), "error": str(e)[:300], "deliveryCount": "see durable ledger"})
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()

"""No network, credentials, database writes or actual IndexNow submissions."""
import copy
import importlib.util
import json
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("cashpath_indexnow", ROOT / "scripts/cashpath-indexnow-release.py")
m = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = m
spec.loader.exec_module(m)
A, B = "a" * 40, "b" * 40


def html(text="Compare loan offers safely.", chunk="one", desc="Compare the written terms.", extra=""):
    return (f'<html><head><title>CashPath guide</title><link rel="canonical" href="https://cashpath.org/p/test"/>'
            f'<meta name="description" content="{desc}"><meta name="robots" content="index, follow">'
            f'<link rel="stylesheet" href="/_next/{chunk}.css"><script>self.__next_f=["{chunk}"]</script>'
            f'</head><body><main class="generated-{chunk}"><h1>Compare offers</h1><p>{text}</p>'
            f'<a href="/p/guides">Read all our complete guides here</a>{extra}</main>'
            '<script type="application/ld+json">{"@type":"BlogPosting","headline":"Guide"}</script></body></html>')


def fp(content, url=m.ORIGIN + "/p/test", xrobots=""):
    facts = m.PageFacts()
    facts.feed(content)
    return facts.fingerprint(url, xrobots)


def state(pages=None, initialized=True):
    return {"version": 1, "host": m.HOST, "initialized": initialized, "lastRelease": A,
            "pages": pages or {}, "pending": None}


class UrlIsolation(unittest.TestCase):
    def test_canonical_home_and_guides(self):
        self.assertEqual(m.canonical_url(m.ORIGIN), m.ORIGIN + "/")
        self.assertEqual(m.canonical_url(m.ORIGIN + "/p/guides/loan-basics"), m.ORIGIN + "/p/guides/loan-basics")

    def test_rejects_other_hosts_and_sensitive_paths(self):
        for bad in ["https://www.cashpath.org/p/test", "https://onestudioos.com/p/test", "http://cashpath.org/",
                    "https://cashpath.org:443/", "https://a@cashpath.org/", m.ORIGIN + "/api/public/analytics",
                    m.ORIGIN + "/admin", m.ORIGIN + "/p/test?email=me@example.com", m.ORIGIN + "/p/test#secret",
                    m.ORIGIN + "/site/cashpath-909c00c9", m.ORIGIN + "/p/../admin", m.ORIGIN + "/p/a%2Fb"]:
            with self.subTest(bad=bad), self.assertRaises(ValueError): m.canonical_url(bad)

    def test_sitemap_deduplicates(self):
        xml = '<urlset><url><loc>https://cashpath.org/</loc></url><url><loc>https://cashpath.org</loc></url></urlset>'
        self.assertEqual(m.parse_sitemap(xml), [m.ORIGIN + "/"])

    def test_sitemap_no_foreign_entries_or_entities(self):
        for xml in ['<urlset><url><loc>https://onestudioos.com/</loc></url></urlset>',
                    '<!DOCTYPE xx><urlset/>', '<sitemapindex/>', '<urlset/>']:
            with self.subTest(xml=xml), self.assertRaises(ValueError): m.parse_sitemap(xml)

    def test_token_cannot_leak_to_cashpath(self):
        with self.assertRaises(ValueError): m.request(m.ORIGIN + "/", token="test-token")

    def test_post_cannot_escape_allowlist(self):
        with self.assertRaises(ValueError): m.request("https://evil.example/", "POST", {"urlList": []})


class SemanticHash(unittest.TestCase):
    def test_build_ids_css_and_javascript_ignored(self):
        self.assertEqual(fp(html(chunk="old")), fp(html(chunk="new")))

    def test_real_content_and_metadata_changes_detected(self):
        original = fp(html())
        self.assertNotEqual(original, fp(html(text="Compare annual percentage rates and fees first.")))
        self.assertNotEqual(original, fp(html(desc="Different description")))
        self.assertNotEqual(original, fp(html(extra='<a href="/p/worksheet">Free worksheet</a>')))

    def test_schema_changes_detected(self):
        self.assertNotEqual(fp(html()), fp(html().replace('"headline":"Guide"', '"headline":"New guide"')))

    def test_json_key_order_ignored(self):
        self.assertEqual(fp(html()), fp(html().replace('{"@type":"BlogPosting","headline":"Guide"}',
                                                      '{"headline":"Guide", "@type":"BlogPosting"}')))

    def test_bad_canonical_and_noindex_fail(self):
        for bad in [html().replace('href="https://cashpath.org/p/test"', 'href="https://other.org/p/test"'),
                    html().replace('index, follow', 'noindex, follow'),
                    html().replace('<h1>', '<h2>').replace('</h1>', '</h2>'),
                    html().replace('<link rel="canonical" href="https://cashpath.org/p/test"/>', '')]:
            with self.assertRaises(ValueError): fp(bad)
        with self.assertRaises(ValueError): fp(html(), xrobots="noindex")

    def test_invalid_json_ld_fails_safe(self):
        with self.assertRaises(ValueError): fp(html().replace('"headline":"Guide"', '"headline":'))

    def test_comment_chunks_do_not_change_text(self):
        self.assertEqual(fp(html(extra='Offer <!-- -->A')), fp(html(extra='Offer A')))


class Events(unittest.TestCase):
    def test_main_push_only(self):
        self.assertEqual(m.expected_release("push", {"ref": "refs/heads/main", "after": A}), A)
        self.assertIsNone(m.expected_release("push", {"ref": "refs/heads/feature", "after": A}))

    def test_deploy_success_production_main_only(self):
        good = {"deployment": {"ref": "main", "sha": A, "environment": "Production"}, "deployment_status": {"state": "success"}}
        self.assertEqual(m.expected_release("deployment_status", good), A)
        for field, val in [("environment", "Preview"), ("ref", "evil"), ("sha", "malformed")]:
            bad = copy.deepcopy(good); bad["deployment"][field] = val
            self.assertIsNone(m.expected_release("deployment_status", bad))
        good["deployment_status"]["state"] = "failure"
        self.assertIsNone(m.expected_release("deployment_status", good))

    def test_dispatch_restricted_to_real_project(self):
        p = {"project": {"id": m.PROJECT}, "environment": "production", "git": {"sha": A}}
        self.assertEqual(m.expected_release("repository_dispatch", {"client_payload": p}), A)
        p["project"]["id"] = "other"
        self.assertIsNone(m.expected_release("repository_dispatch", {"client_payload": p}))

    def test_live_release_gate(self):
        r = {"version": 1, "host": m.HOST, "projectId": m.PROJECT, "environment": "production",
             "commit": A, "deployment": "onestudio-test.vercel.app", "sitemapUrl": m.ORIGIN + "/sitemap.xml",
             "keyLocation": m.ORIGIN + "/testkey123.txt"}
        self.assertEqual(m.validate_release(r, A), "testkey123")
        for field, val in [("host", "onestudioos.com"), ("environment", "preview"), ("commit", B),
                           ("projectId", "other"), ("keyLocation", "https://evil.example/key.txt")]:
            with self.subTest(field=field), self.assertRaises(ValueError): m.validate_release({**r, field: val}, A)


class Checkpoint(unittest.TestCase):
    def test_baseline_does_not_resubmit_old_urls(self):
        saves, calls = [], []
        result = m.reconcile(state(initialized=False), {"/": "1" * 64}, B,
                             lambda s: saves.append(copy.deepcopy(s)), lambda u: calls.append(u))
        self.assertEqual(result["result"], "baseline_initialized")
        self.assertEqual(calls, [])
        self.assertTrue(saves[-1]["initialized"])

    def test_unchanged_release_no_post(self):
        calls = []
        result = m.reconcile(state({"/": "1" * 64}), {"/": "1" * 64}, B, lambda s: None, lambda u: calls.append(u))
        self.assertEqual(result["urlCount"], 0)
        self.assertEqual(calls, [])

    def test_only_new_and_modified_pages_sent(self):
        saves, calls = [], []
        def send(urls):
            self.assertEqual(saves[-1]["pending"]["urls"], urls)
            calls.extend(urls)
            return 200
        result = m.reconcile(state({"/": "1" * 64, "/p/a": "2" * 64}),
                             {"/": "1" * 64, "/p/a": "3" * 64, "/p/new": "4" * 64}, B,
                             lambda s: saves.append(copy.deepcopy(s)), send)
        self.assertEqual(calls, [m.ORIGIN + "/p/a", m.ORIGIN + "/p/new"])
        self.assertEqual(result["urlCount"], 2)
        calls.clear()
        m.reconcile(saves[-1], saves[-1]["pages"], B, lambda s: None, send)
        self.assertEqual(calls, [])

    def test_202_is_accepted_not_indexed(self):
        result = m.reconcile(state(), {"/": "1" * 64}, B, lambda s: None, lambda u: 202)
        self.assertEqual(result["receipts"][0]["status"], "accepted_pending_key_validation")
        self.assertNotIn("indexed", result)

    def test_http_failure_does_not_advance_fingerprints(self):
        saves = []
        with self.assertRaises(RuntimeError):
            m.reconcile(state(), {"/": "1" * 64}, B, lambda s: saves.append(copy.deepcopy(s)), lambda u: 429)
        self.assertEqual(saves[-1]["pages"], {})
        self.assertIsNone(saves[-1]["pending"])

    def test_timeout_preserves_pending_and_prevents_duplicate(self):
        saves, calls = [], []
        def timeout(urls):
            calls.append(urls)
            raise TimeoutError()
        with self.assertRaises(RuntimeError):
            m.reconcile(state(), {"/": "1" * 64}, B, lambda s: saves.append(copy.deepcopy(s)), timeout)
        self.assertTrue(saves[-1]["pending"])
        with self.assertRaises(RuntimeError):
            m.reconcile(saves[-1], {"/": "1" * 64}, B, lambda s: None, timeout)
        self.assertEqual(len(calls), 1)

    def test_checkpoint_failure_prevents_post(self):
        calls = []
        def broken(s): raise RuntimeError("no write permission")
        with self.assertRaises(RuntimeError):
            m.reconcile(state(), {"/": "1" * 64}, B, broken, lambda u: calls.append(u))
        self.assertEqual(calls, [])

    def test_removed_sitemap_url_is_not_misreported_as_deleted(self):
        result = m.reconcile(state({"/p/old": "1" * 64}), {}, B, lambda s: None, lambda u: self.fail("must not POST"))
        self.assertEqual(result["removedFromSitemap"], ["/p/old"])

    def test_state_roundtrip_and_malformed_state_fails(self):
        body = 'Readme\n' + m.STATE_START + '\n```json\n' + json.dumps(state()) + '\n```\n' + m.STATE_END
        wanted = state({"/p/test": "1" * 64})
        self.assertEqual(m.parse_state(m.state_body(body, wanted)), wanted)
        with self.assertRaises(ValueError): m.parse_state("no checkpoint")
        with self.assertRaises(ValueError): m.parse_state(body.replace(m.HOST, "evil.example"))

    def test_batching_stays_below_protocol_limit(self):
        calls = []
        pages = {f"/p/page-{n}": "1" * 64 for n in range(205)}
        result = m.reconcile(state(), pages, B, lambda s: None, lambda u: calls.append(u) or 200)
        self.assertEqual([len(c) for c in calls], [100, 100, 5])
        self.assertEqual(result["urlCount"], 205)


class WorkflowContract(unittest.TestCase):
    def test_no_secrets_or_page_mutation_access(self):
        workflow = (ROOT / ".github/workflows/cashpath-indexnow.yml").read_text()
        self.assertIn("cancel-in-progress: false", workflow)
        self.assertIn("branches: [main]", workflow)
        self.assertIn("issues: write", workflow)
        self.assertNotIn("contents: write", workflow)
        self.assertNotIn("VERCEL_TOKEN", workflow)
        self.assertNotIn("SUPABASE", workflow)
        self.assertNotIn("schedule:", workflow)

    def test_public_route_has_no_write_method(self):
        route = (ROOT / "app/api/public/cashpath-indexnow-release/route.ts").read_text()
        self.assertIn('host !== HOST', route)
        self.assertIn('VERCEL_ENV !== "production"', route)
        self.assertIn('VERCEL_GIT_COMMIT_SHA', route)
        self.assertIn('"noindex, nofollow"', route)
        self.assertNotIn("export function POST", route)
        self.assertNotIn("supabase", route.lower())


if __name__ == "__main__": unittest.main()

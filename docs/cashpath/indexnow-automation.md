# CashPath automatic release notifications

## Purpose and scope

After a successful production release, notify IndexNow of new or meaningfully
changed public **cashpath.org** pages. This is a separate workflow; it neither
reuses the OneStudio-only URL filter nor changes the existing platform sender.
It never submits a loan application, changes page content, touches analytics,
or writes to Supabase.

Files:
- `.github/workflows/cashpath-indexnow.yml`
- `scripts/cashpath-indexnow-release.py` (Python standard library)
- `app/api/public/cashpath-indexnow-release/route.ts` (read-only identity)
- `tests/test_cashpath_indexnow.py`

## When it runs

The primary trigger is a push/merge to **main**. It waits up to 20 minutes until
CashPath's real public domain reports the exact release commit in production.
A failed, queued or preview build cannot pass that gate. Superseded main pushes
are skipped; the next live release compares against the last accepted state.

Production `deployment_status` and Vercel `repository_dispatch` success/promote
events are additional triggers for redeployments. The public identity gate is
still mandatory and allows only the `onestudio-os` project. Unrecognized event
payloads fail closed; the main-push trigger does not depend on those payloads.
A main-only **Run workflow** control supports a read-only dry run.

This is not a periodic full-library submission. No cron job is installed.
Edits saved in the site editor without a code release retain their existing
publish-time behavior; this workflow is specifically post-deployment.

## How pages are selected

1. Fetch the public identity and IndexNow verification file without authentication,
   cookies or deployment-protection bypass. The key file must return 200 and match.
2. Fetch the canonical domain's sitemap. Only HTTPS `cashpath.org/` and `/p/...`
   paths are accepted. No www, other tenants, preview hosts, credentials or queries.
3. Read current sitemap pages with at most two concurrent GETs, bounded retries
   for transient errors and a 10 MiB response ceiling. This does not run JavaScript.
4. Compute SHA-256 fingerprints from rendered text, page links/images, relevant
   SEO metadata and JSON-LD. Ignore scripts, hydration payloads, chunk filenames,
   style classes and resource preloads so a rebuild alone is not a content change.
5. Compare with the persistent accepted fingerprints in **GitHub issue #38**.
   Send only new/changed fingerprints, in batches of at most 100.
6. Recheck the live release before each batch. Keep `lastmod` and page content
   untouched. No fake freshness dates are written.

Sitemap removals are reported, not guessed to be confirmed page deletions. A
current sitemap URL that returns an error/noindex/non-self-canonical blocks the
batch rather than advertising a broken page. The current safety cap is 500 URLs;
increase it only with checkpoint-size and runtime review.

## Persistent state, receipts, and failures

[Issue #38](https://github.com/ternzina/onestudio-os/issues/38) contains the current
checkpoint; comments preserve release time, URLs, HTTP status and run link. State
lives outside Git, so checkpoint writes do not trigger additional site builds.
The first successful installation run establishes a **no-submit baseline** of
existing pages. It must not resend the 13 URLs already accepted at 17:27 UTC on
13 October 2026. Later content changes are compared with this baseline.

The workflow uses its repository-provided `GITHUB_TOKEN` with **contents:read**
and **issues:write**. No Vercel token, Supabase credential, paid plugin, external
account or newly stored secret is needed. The read-only public identity exposes
only release metadata and the already-public IndexNow verification-file URL.
It does not expose an authenticated API key or permit triggering submissions.

All runs share a single concurrency group and do not cancel in-flight work.
Before POST, the exact batch is durably marked `pending`. On 200/202, fingerprints
advance and an HTTP receipt is stored. HTTP rejection does not advance state.
A timeout, lost response or checkpoint write failure leaves an unresolved pending
batch and stops duplicate sends. Review the run/IndexNow receipt before manually
clearing that field. Do not simply delete the ledger to make an error go away.
No automatic POST retries are performed on an ambiguous result.

`200` means received; `202` means received with key validation pending. Neither
means indexed, recommended by ChatGPT or ranked. An empty accepted batch means
no content changes, not an error.

## Operating controls

- Review runs under **Actions → CashPath IndexNow after production**.
- Review durable state and receipts in issue #38.
- **Pause:** close issue #38 or disable this workflow in Actions.
- **Resume:** reopen issue #38; preserve the checkpoint, then run the main workflow.
- **Read-only check:** Run workflow with `dry_run=true`.
- **Rollback:** revert the workflow, script and read-only endpoint. Keep the ledger
  as a historical receipt. No database rollback or loan-provider change is needed.

## Validation

Run `python3 -m unittest discover -s tests -p 'test_cashpath_indexnow.py' -v`.
Tests cover source isolation, fingerprint stability across rebuilds, changes to
content/metadata/schema, live release gating, bootstrap without resubmission,
200/202 semantics, rejected/ambiguous deliveries, write-ahead ordering, batch
sizes, and preservation of the existing platform sender and restricted permissions.

Installation acceptance requires a successful main workflow that records the
baseline in issue #38, not just a green Vercel build. Future real content changes
will exercise external submission; do not fake page edits to inflate counters.

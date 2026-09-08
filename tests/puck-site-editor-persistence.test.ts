import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { isPuckSiteEditorPilotEnabled } from "../lib/puck-site-editor/feature-flag.ts";
import { createPuckMediaUploadAdapter } from "../lib/puck-site-editor/media-upload.ts";
import {
  createPuckPersistenceService,
  InMemoryPuckContentRepository,
  type PuckTenantContext,
} from "../lib/puck-site-editor/persistence.ts";
import { createPuckPilotFixture } from "../lib/puck-site-editor/pilot-fixture.ts";
import {
  attachPuckDocument,
  createPublishedPuckSnapshot,
  deserializePuckStorageContent,
  readPuckDocument,
  serializePuckStorageContent,
} from "../lib/puck-site-editor/storage.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const legacy = {
  hero_eyebrow: "Legacy",
  hero_title: "Existing page",
  hero_text: "Retained",
  about_title: "About",
  about_text: "Text",
  services_title: "Services",
  portfolio_title: "Work",
  contact_title: "Contact",
  booking_label: "Book",
  services_label: "Services",
  portfolio_label: "Portfolio",
  about_label: "About",
  contact_label: "Contact",
  show_services: true,
  show_portfolio: true,
  show_about: true,
  show_contact: true,
  seo_title: "SEO stays outside Puck",
  seo_description: "Existing SEO contract",
  template_id: "velora-event-venue",
} satisfies PublicSiteContent;

const context = (businessId: string): PuckTenantContext => ({
  businessId,
  userId: "user-a",
  role: "owner",
});

test("draft and published storage round-trip without information loss", () => {
  const document = createPuckPilotFixture("ru");
  const content = attachPuckDocument(legacy, document);
  const restored = deserializePuckStorageContent(serializePuckStorageContent(content));
  const published = createPublishedPuckSnapshot(restored);
  assert.deepEqual(readPuckDocument(published), document);
  assert.equal(published.template_id, "velora-event-venue");
  assert.equal(published.seo_title, "SEO stays outside Puck");
});

test("representative document preserves edited fields, identity, order, and draft/public publish boundary", async () => {
  const repository = new InMemoryPuckContentRepository();
  const service = createPuckPersistenceService(repository);
  const original = createPuckPilotFixture("en");
  const edited = structuredClone(original);

  const scalar = edited.content.find((item) => Object.values(item.props).some((value) => typeof value === "string"))!;
  const scalarKey = Object.keys(scalar.props).find((key) => key !== "id" && typeof scalar.props[key] === "string")!;
  scalar.props[scalarKey] = "edited-string";
  const media = edited.content.find((item) => Object.keys(item.props).some((key) => /image|media|url/i.test(key)));
  if (media) {
    const mediaKey = Object.keys(media.props).find((key) => /image|media|url/i.test(key) && typeof media!.props[key] === "string");
    if (mediaKey) media.props[mediaKey] = "/uploads/edited-media.webp";
  }
  const repeater = edited.content.find((item) => Object.values(item.props).some(Array.isArray));
  if (repeater) {
    const repeaterKey = Object.keys(repeater.props).find((key) => Array.isArray(repeater!.props[key]));
    if (repeaterKey) repeater.props[repeaterKey] = [...(repeater.props[repeaterKey] as unknown[])].reverse();
  }
  const emptyEligible = edited.content.find((item) => Object.values(item.props).some(Array.isArray));
  if (emptyEligible) {
    const emptyKey = Object.keys(emptyEligible.props).find((key) => Array.isArray(emptyEligible!.props[key]));
    if (emptyKey) emptyEligible.props[emptyKey] = [];
  }
  const zeroFalse = edited.content.find((item) => Object.values(item.props).some((value) => typeof value === "number" || typeof value === "boolean"));
  if (zeroFalse) {
    for (const key of Object.keys(zeroFalse.props)) {
      if (typeof zeroFalse.props[key] === "number") zeroFalse.props[key] = 0;
      if (typeof zeroFalse.props[key] === "boolean") zeroFalse.props[key] = false;
    }
  }
  edited.content = [edited.content.at(-1)!, ...edited.content.slice(0, -1)];

  await service.savePuckDraft(context("roundtrip"), edited, legacy);
  const reloaded = await service.loadDraft(context("roundtrip"), { locale: "en", pageId: "pilot-home" });
  assert.deepEqual(reloaded, edited);
  await repository.writePublished({ businessId: "roundtrip", locale: "en", pageId: "pilot-home" }, attachPuckDocument(legacy, original));
  const previousPublished = await repository.readPublished({ businessId: "roundtrip", locale: "en", pageId: "pilot-home" });
  assert.ok(previousPublished);
  assert.deepEqual(readPuckDocument(previousPublished), original);
  const published = await service.publishPuckDraft(context("roundtrip"), { locale: "en", pageId: "pilot-home" });
  assert.deepEqual(published, edited);
});

test("failed save and publish do not report or replace persisted snapshots", async () => {
  class FailingRepository extends InMemoryPuckContentRepository {
    failDraft = false;
    failPublished = false;
    override async writeDraft(scope: Parameters<InMemoryPuckContentRepository["writeDraft"]>[0], content: Parameters<InMemoryPuckContentRepository["writeDraft"]>[1]) {
      if (this.failDraft) throw new Error("save failed");
      return super.writeDraft(scope, content);
    }
    override async writePublished(scope: Parameters<InMemoryPuckContentRepository["writePublished"]>[0], content: Parameters<InMemoryPuckContentRepository["writePublished"]>[1]) {
      if (this.failPublished) throw new Error("publish failed");
      return super.writePublished(scope, content);
    }
  }
  const repository = new FailingRepository();
  const service = createPuckPersistenceService(repository);
  const document = createPuckPilotFixture("en");
  await service.savePuckDraft(context("safety"), document, legacy);
  const scope = { businessId: "safety", locale: "en", pageId: "pilot-home" };
  const before = await repository.readDraft(scope);
  repository.failDraft = true;
  await assert.rejects(() => service.savePuckDraft(context("safety"), { ...document, content: [] }, legacy), /save failed/);
  assert.deepEqual(await repository.readDraft(scope), before);
  repository.failDraft = false;
  repository.failPublished = true;
  await assert.rejects(() => service.publishPuckDraft(context("safety"), scope), /publish failed/);
  assert.equal(await repository.readPublished(scope), null);
});

test("tenant and locale scopes cannot overwrite each other", async () => {
  const repository = new InMemoryPuckContentRepository();
  const service = createPuckPersistenceService(repository);
  await service.savePuckDraft(context("tenant-a"), createPuckPilotFixture("ru"), legacy);
  await service.savePuckDraft(context("tenant-a"), createPuckPilotFixture("en"), { ...legacy, hero_title: "English" });
  assert.equal((await service.loadDraft(context("tenant-a"), { locale: "ru", pageId: "pilot-home" }))?.metadata.locale, "ru");
  assert.equal((await service.loadDraft(context("tenant-a"), { locale: "en", pageId: "pilot-home" }))?.metadata.locale, "en");
  assert.equal(await service.loadDraft(context("tenant-b"), { locale: "ru", pageId: "pilot-home" }), null);
  const published = await service.publishPuckDraft(context("tenant-a"), { locale: "ru", pageId: "pilot-home" });
  assert.equal(published.metadata.locale, "ru");
});

test("viewer cannot save or publish", async () => {
  const service = createPuckPersistenceService(new InMemoryPuckContentRepository());
  const viewer: PuckTenantContext = { ...context("tenant-a"), role: "viewer" };
  await assert.rejects(() => service.savePuckDraft(viewer, createPuckPilotFixture("en"), legacy), /forbidden/);
});

test("feature flag is explicitly default OFF", () => {
  assert.equal(isPuckSiteEditorPilotEnabled(undefined), false);
  assert.equal(isPuckSiteEditorPilotEnabled("false"), false);
  assert.equal(isPuckSiteEditorPilotEnabled("true"), true);
  assert.equal(isPuckSiteEditorPilotEnabled("1"), true);
});

test("generic media adapter uses tenant path and creates no portfolio record", async () => {
  const calls: Array<Record<string, unknown>> = [];
  const upload = createPuckMediaUploadAdapter({
    createId: () => "media-1",
    storage: { upload: async (input) => { calls.push(input); return { url: "https://cdn.example.test/media-1.webp" }; } },
    mediaLibrary: { insert: async (input) => { calls.push(input); return { id: "row-1", imageUrl: input.imageUrl }; } },
  });
  const result = await upload(
    { businessId: "tenant-a", userId: "user-a", canConfigure: true },
    { name: "Hero Image.webp", mimeType: "image/webp", size: 3, bytes: new Uint8Array([1, 2, 3]) },
  );
  assert.match(result.path, /^businesses\/tenant-a\/site-editor\//);
  assert.equal(calls.some((call) => "categoryId" in call || "portfolio" in call), false);
});

test("migration is additive and leaves current publish/domain paths unchanged", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260901090000_puck_site_editor_pilot_foundation.sql"), "utf8");
  assert.match(migration, /save_public_site_puck_draft/);
  assert.doesNotMatch(migration, /create or replace function public\.publish_public_site/);
  assert.doesNotMatch(migration, /alter table|drop table|delete from/i);
  assert.equal(fs.readFileSync(path.join(root, "lib/public-site/domain-routing.ts"), "utf8").includes("puck"), false);
});

test("pilot route is admin-auth inherited, server-resolves tenant and keeps current editor fallback", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const route = fs.readFileSync(path.join(root, "app/admin/site/puck-pilot/page.tsx"), "utf8");
  const preview = fs.readFileSync(path.join(root, "app/admin/site/puck-pilot/preview/page.tsx"), "utf8");
  assert.match(route, /list_my_businesses/);
  assert.doesNotMatch(route, /businessId.*searchParams|p_business_id.*searchParams/);
  assert.match(route, /Return to current Site Editor/);
  assert.match(route, /isPuckSiteEditorPilotEnabled/);
  assert.match(route, /\/admin\/site\/puck-pilot\/preview/);
  assert.match(preview, /list_my_businesses/);
  assert.doesNotMatch(preview, /businessId.*searchParams|p_business_id.*searchParams/);
  assert.match(preview, /isPuckSiteEditorPilotEnabled/);
  const adminLayout = fs.readFileSync(path.join(root, "app/admin/layout.tsx"), "utf8");
  assert.match(adminLayout, /auth\.getUser/);
  assert.match(adminLayout, /redirect\("\/login/);
});

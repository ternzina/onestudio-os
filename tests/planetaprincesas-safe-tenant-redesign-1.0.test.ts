import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import {
  createPlanetaPrincesasTenantContent,
  PLANETA_PRINCESAS_CONTENT,
  PLANETA_PRINCESAS_LAYOUT_ORDER,
} from "../lib/public-site/planetaprincesas-tenant.ts";
import { createVeloraPremiumTemplateSeed } from "../lib/public-site/velora-premium-template-seed.ts";
import { createPublicSiteMetadata } from "../lib/public-site/metadata.ts";
import {
  resolveVeloraContent,
  VELORA_TEMPLATE_KEY,
} from "../lib/public-site/velora-premium-template-content.ts";
import {
  buildVeloraInspectorFields,
  resetVeloraSection,
} from "../lib/public-site/velora-editor-schema.ts";
import type { EditorInspectorPlacedField } from "../lib/public-site/editor-spec.ts";
import { VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/velora-premium-template-editor-adapter.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

const migrationUrl = new URL(
  "../supabase/migrations/20260910190000_planetaprincesas_safe_tenant_redesign_1_0.sql",
  import.meta.url,
);

const imageNames = [
  "hero-hacienda",
  "salon-estelar",
  "jardin-de-luz",
  "atelier-real",
  "transformacion-antes",
  "transformacion-despues",
  "quinceanera",
  "gastronomia",
  "diseno-floral",
  "coordinadora",
  "baile-nocturno",
  "brindis-familiar",
];

test("PLANETA PRINCESAS content is Spanish, complete and tenant-owned", () => {
  const content = createPlanetaPrincesasTenantContent();
  const serialized = JSON.stringify(content).replaceAll(VELORA_TEMPLATE_KEY, "");
  assert.equal(content.brand_name, "PLANETA PRINCESAS");
  assert.equal(content.template_id, VELORA_TEMPLATE_KEY);
  assert.equal(content.theme_dark, "#100A1C");
  assert.equal(content.theme_surface, "#FBF7EF");
  assert.deepEqual(content.layout_order, PLANETA_PRINCESAS_LAYOUT_ORDER);
  assert.equal(content.pages?.length, 2);
  assert.deepEqual(content.pages?.map((page) => page.slug), ["espacios", "experiencias"]);
  assert.doesNotMatch(
    serialized,
    /VELORA|EVENT HOUSE|Киев|Kyiv|Grand Hall|Garden Room|events@velora\.house|\+380 44 555 24 24/i,
  );
  assert.doesNotMatch(serialized, /\/templates\/velora\//i);
  assert.match(PLANETA_PRINCESAS_CONTENT.hero.eyebrow, /CELEBRACIONES EXTRAORDINARIAS/);
  assert.equal(PLANETA_PRINCESAS_CONTENT.visualVariant, "planeta-princesas");
  assert.equal(PLANETA_PRINCESAS_CONTENT.contact.address, "");
  assert.equal(PLANETA_PRINCESAS_CONTENT.contact.phone, "");
  assert.equal(
    PLANETA_PRINCESAS_CONTENT.contact.email,
    "planetaprincesas@gmail.com",
  );
  for (const image of imageNames)
    assert.match(serialized, new RegExp(`/tenants/planetaprincesas/${image}\\.webp`));
});

test("all twelve editorial assets are local, valid and reasonably sized WebP files", async () => {
  for (const name of imageNames) {
    const url = new URL(`../public/tenants/planetaprincesas/${name}.webp`, import.meta.url);
    const [bytes, metadata] = await Promise.all([readFile(url), stat(url)]);
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", name);
    assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", name);
    assert.ok(metadata.size >= 50_000, `${name} is unexpectedly small`);
    assert.ok(metadata.size <= 400_000, `${name} is larger than the performance budget`);
  }
});

test("tenant migration embeds the reviewed content and cannot mutate domain or AdSense settings", async () => {
  const migration = await readFile(migrationUrl, "utf8");
  const embedded = migration.match(/\$content\$(.*?)\$content\$/s)?.[1];
  assert.ok(embedded, "migration content payload missing");
  assert.deepEqual(JSON.parse(embedded), createPlanetaPrincesasTenantContent());
  assert.match(migration, /v_target_count <> 1/);
  assert.match(migration, /planetaprincesas\.com/g);
  assert.match(migration, /planetaprincesas_template_guard_failed/);
  assert.match(migration, /planetaprincesas_legacy_content_remains/);
  assert.match(migration, /#- array\['template_content', v_template_key\]/g);
  assert.match(migration, /v_monetization_after is distinct from v_monetization_before/);
  assert.match(migration, /v_domain_after is distinct from v_domain_before/);
  assert.doesNotMatch(migration, /update\s+public\.site_monetization_settings/i);
  assert.doesNotMatch(migration, /update\s+public\.public_site_domains/i);
  assert.doesNotMatch(migration, /ca-pub-[0-9]{16}/);
});

test("canonical VELORA defaults and demo seed remain independent", async () => {
  const seed = createVeloraPremiumTemplateSeed("ru");
  const resolved = resolveVeloraContent(seed);
  assert.equal(resolved.brand, "VELORA");
  assert.equal(resolved.visualVariant, undefined);
  assert.equal(resolved.hero.image, "/templates/velora/hero-cinematic.webp");
  assert.doesNotMatch(JSON.stringify(seed), /tenants\/planetaprincesas/);
  const emptyLegacyContact = resolveVeloraContent({
    ...seed,
    template_content: {
      [VELORA_TEMPLATE_KEY]: { contact: { address: "" } },
    },
  });
  assert.equal(emptyLegacyContact.contact.address, resolved.contact.address);

  const [seedSource, demoSource, templateAssets] = await Promise.all([
    readFile(new URL("../lib/public-site/velora-premium-template-seed.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/velora-demo.ts", import.meta.url), "utf8"),
    stat(new URL("../public/templates/velora/hero-cinematic.webp", import.meta.url)),
  ]);
  assert.match(seedSource, /brand_name: "VELORA"/);
  assert.match(demoSource, /name: "VELORA HOUSE"/);
  assert.ok(templateAssets.size > 0);
});

test("Site Editor reset uses the tenant baseline without restoring VELORA", () => {
  const editedContent = createPlanetaPrincesasTenantContent();
  const edited = resolveVeloraContent(editedContent);
  edited.hero.title = "Borrador temporal";
  editedContent.template_content = {
    ...editedContent.template_content,
    [VELORA_TEMPLATE_KEY]: edited,
  };
  const reset = resetVeloraSection(edited, "hero", PLANETA_PRINCESAS_CONTENT);
  assert.equal(reset.hero.title, PLANETA_PRINCESAS_CONTENT.hero.title);
  assert.equal(reset.visualVariant, "planeta-princesas");
  assert.doesNotMatch(JSON.stringify(reset), /\/templates\/velora\//i);

  const restored = VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.restoreTemplate(
    editedContent,
  );
  assert.equal(restored.brand_name, "PLANETA PRINCESAS");
  assert.equal(resolveVeloraContent(restored).hero.title, PLANETA_PRINCESAS_CONTENT.hero.title);
  assert.doesNotMatch(JSON.stringify(restored), /\/templates\/velora\//i);
});

test("VELORA inspector fields retain the tenant baseline as originalValue", () => {
  const original = resolveVeloraContent(createPlanetaPrincesasTenantContent());
  const edited = structuredClone(original);
  edited.decor.title = "Borrador temporal";
  edited.decor.image = "/tenants/planetaprincesas/borrador.webp";

  const fields: EditorInspectorPlacedField[] = buildVeloraInspectorFields(
    edited,
    "decor",
    false,
    () => {},
    () => {},
    original,
  );
  const title = fields.find((field) => field.id === "title");
  const image = fields.find((field) => field.id === "image");

  assert.equal(title?.type, "textarea");
  assert.equal(
    title && "originalValue" in title ? title.originalValue : undefined,
    original.decor.title,
  );
  assert.equal(image?.type, "media");
  assert.equal(
    image && "originalValue" in image ? image.originalValue : undefined,
    original.decor.image,
  );
});

test("Spanish SEO and Open Graph resolve to the tenant-owned hero", () => {
  const content = createPlanetaPrincesasTenantContent();
  const site: PublicSiteData = {
    business: {
      id: "planetaprincesas-test",
      slug: "planetaprincesas",
      name: "PLANETA PRINCESAS",
      locale: "es",
      primary_locale: "es",
      currency: "EUR",
      timezone: "Europe/Madrid",
    },
    content,
    company: { display_name: "PLANETA PRINCESAS" },
    services: [],
    portfolio: [],
    capabilities: { booking: true, catalog: true, portfolio: true },
    available_locales: ["es"],
    published_at: null,
  };
  const metadata = createPublicSiteMetadata(site, "es", {
    origin: "https://planetaprincesas.com",
    cleanUrls: true,
  });
  assert.equal(
    (metadata.title as { absolute: string }).absolute,
    "PLANETA PRINCESAS | Celebraciones extraordinarias",
  );
  assert.equal(metadata.openGraph?.locale, "es");
  assert.deepEqual(metadata.openGraph?.images, [
    {
      url: "https://planetaprincesas.com/tenants/planetaprincesas/hero-hacienda.webp",
      alt: "PLANETA PRINCESAS | Celebraciones extraordinarias",
    },
  ]);
});

test("public runtime exposes Spanish accessibility copy and tenant-scoped backgrounds", async () => {
  const [site, customPage, interactions, footer, css] = await Promise.all([
    readFile(new URL("../components/public/velora/VeloraSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/VeloraCustomPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/VeloraInteractions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/VeloraFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/Velora.module.css", import.meta.url), "utf8"),
  ]);
  assert.match(site, /Saltar al contenido/);
  assert.match(site, /Navegación principal/);
  assert.match(customPage, /data-visual-variant/);
  assert.match(interactions, /Fecha:.*Formato:.*Invitados:.*Espacio:.*Experiencia:/s);
  assert.match(footer, /hasContact \? \(/);
  assert.match(css, /data-visual-variant="planeta-princesas"/);
  const tenantCss = css.slice(css.indexOf("/* Tenant-owned visual direction"));
  assert.doesNotMatch(tenantCss, /\/templates\/velora\//i);
  for (const image of [
    "hero-hacienda",
    "quinceanera",
    "salon-estelar",
    "gastronomia",
    "atelier-real",
    "jardin-de-luz",
  ]) {
    assert.match(
      tenantCss,
      new RegExp(`/tenants/planetaprincesas/${image}\\.webp`),
    );
  }
});

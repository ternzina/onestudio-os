import assert from "node:assert/strict";
import test from "node:test";
import { RASTEM_CENTER_EDITOR_SPECS, buildRastemCenterInspectorFields } from "../lib/public-site/rastem-center-editor-schema.ts";
import { createRastemCenterPremiumTemplateSeed } from "../lib/public-site/rastem-center-premium-template-seed.ts";
import { DEFAULT_RASTEM_CENTER_CONTENT, resolveRastemCenterContent, withRastemCenterContent } from "../lib/public-site/rastem-center-premium-template-content.ts";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/rastem-center-premium-template-contract.ts";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/rastem-center-premium-template-editor-adapter.ts";

const sections = RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id);
const mediaPaths = ["hero.image", ...Array.from({ length: 4 }, (_, index) => `ages.items.${index}.image`), ...Array.from({ length: 6 }, (_, index) => `programs.items.${index}.image`), ...Array.from({ length: 3 }, (_, index) => `teachers.items.${index}.image`), ...Array.from({ length: 6 }, (_, index) => `gallery.images.${index}`)];

function fieldsFor(sectionId: typeof sections[number]) {
  const chosen: unknown[] = [];
  const seed = createRastemCenterPremiumTemplateSeed();
  const fields = RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({ content: seed, sectionId, disabled: false, onChange: () => undefined, onChooseMedia: (target) => chosen.push(target) });
  return { fields, chosen };
}

test("Rastem exposes declarative inspector configuration for all 14 canonical sections", () => {
  assert.deepEqual(sections, ["hero", "ages", "programs", "schedule", "teachers", "trial", "benefits", "memberships", "parents", "gallery", "testimonials", "faq", "contact", "footer"]);
  for (const section of sections) {
    const { fields } = fieldsFor(section);
    assert.ok(fields.length > 0, `${section} has no inspector fields`);
    assert.ok(fields.some((field) => field.type === "typography") === (section !== "footer"), `${section} typography configuration mismatch`);
  }
  assert.ok(fieldsFor("footer").fields.some((field) => field.id === "footer-cta"));
  assert.ok(fieldsFor("footer").fields.some((field) => field.id === "footer.navigation-0-label"));
});

test("Rastem exposes 20 generic media placements with exact content paths and originals", () => {
  const actual = [] as { path: string; value: string; originalValue: string; target: unknown }[];
  for (const section of sections) {
    const { fields, chosen } = fieldsFor(section);
    fields.filter((field) => field.type === "media").forEach((field) => {
      assert.equal(field.type, "media");
      (field as { onChoose: () => void }).onChoose();
      const target = chosen.shift();
      actual.push({ path: (target as { path: string }).path, value: field.value, originalValue: field.originalValue ?? "", target });
    });
  }
  assert.deepEqual(actual.map(({ path }) => path), mediaPaths);
  assert.equal(actual.length, 20);
  for (const item of actual) {
    assert.equal(item.value, item.originalValue);
    assert.equal((item.target as { kind: string }).kind, "template-content");
    assert.equal((item.target as { templateKey: string }).templateKey, "rastem-center");
    assert.equal((item.target as { path: string }).path, item.path);
    assert.ok(item.originalValue.startsWith("/templates/rastem-center/"));
  }
});

test("Rastem section reset restores text, media, preserves other sections and clears heading typography", () => {
  const seed = createRastemCenterPremiumTemplateSeed();
  const original = resolveRastemCenterContent(seed);
  const changed = withRastemCenterContent(seed, {
    ...original,
    headingTypography: { hero: { font_size: 64 }, teachers: { font_weight: 700 } },
    hero: { ...original.hero, title: "Changed hero", image: "/templates/rastem-center/teacher-jan.webp" },
    ages: { ...original.ages, title: "Changed ages" },
    teachers: { ...original.teachers, items: original.teachers.items.map((item, index) => index === 1 ? { ...item, image: "/templates/rastem-center/hero-platform.webp" } : item) },
    gallery: { ...original.gallery, images: original.gallery.images.map((image, index) => index === 2 ? "/templates/rastem-center/teacher-elena.webp" : image) },
  });
  const heroReset = resolveRastemCenterContent(RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.resetSection(changed, "hero"));
  assert.equal(heroReset.hero.title, DEFAULT_RASTEM_CENTER_CONTENT.hero.title);
  assert.equal(heroReset.hero.image, DEFAULT_RASTEM_CENTER_CONTENT.hero.image);
  assert.equal(heroReset.ages.title, "Changed ages");
  assert.equal(heroReset.headingTypography.hero, undefined);
  assert.deepEqual(heroReset.headingTypography.teachers, { font_weight: 700 });
  const teacherReset = resolveRastemCenterContent(RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.resetSection(changed, "teachers"));
  assert.equal(teacherReset.teachers.items[1].image, DEFAULT_RASTEM_CENTER_CONTENT.teachers.items[1].image);
  const galleryReset = resolveRastemCenterContent(RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER.resetSection(changed, "gallery"));
  assert.equal(galleryReset.gallery.images[2], DEFAULT_RASTEM_CENTER_CONTENT.gallery.images[2]);
});

test("Rastem schema stays compatible with RU and EN content shapes", () => {
  const seed = createRastemCenterPremiumTemplateSeed("ru");
  const english = createRastemCenterPremiumTemplateSeed("en");
  for (const section of sections) {
    assert.equal(buildRastemCenterInspectorFields(resolveRastemCenterContent(seed), section, false, () => undefined).length, buildRastemCenterInspectorFields(resolveRastemCenterContent(english), section, false, () => undefined).length);
  }
});

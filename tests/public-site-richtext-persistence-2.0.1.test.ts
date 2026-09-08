import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CASH_PATH_GUIDES } from "../lib/public-site/cashpath-guides.generated.ts";
import {
  needsCashPathGuideRichTextRepair,
  repairCashPathGuideRichText,
} from "../lib/public-site/cashpath-guide-richtext-repair.ts";
import { decodeRichText, encodeRichText } from "../lib/public-site/rich-text.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const guide = (slug: string) => {
  const result = CASH_PATH_GUIDES.find((item) => item.slug === slug);
  assert.ok(result, `missing guide ${slug}`);
  return result;
};

const aprGuide = () => guide("what-is-apr-on-a-personal-loan");
const rateGuide = () => guide("apr-vs-interest-rate");
const cloneGuide = (slug: string) => {
  const source = guide(slug);
  return { ...source, blocks: source.blocks?.map((block) => ({ ...block })) };
};

test("Guide #2 intro is valid rich text before persistence and exposes the historical truncation failure", () => {
  const intro = rateGuide().intro;
  assert.match(intro, /^__osrt1__:/);
  assert.ok(intro.length > 1000);
  assert.ok(decodeRichText(intro));
  assert.equal(decodeRichText(intro.slice(0, 1000)), null);
});

test("rich-text migration defines atomic serialized limits rather than cutting JSON", async () => {
  const migration = await readFile(
    new URL("../supabase/migrations/20260909010000_public_site_rich_text_persistence_2_0_1.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /normalize_public_site_rich_text_value/);
  assert.match(migration, /public_site_rich_text_limit_exceeded/);
  assert.match(migration, /public_site_rich_text_invalid/);
  assert.match(migration, /item->>'intro',1000,20000/);
  assert.match(migration, /p_source->>'text', 4000, 40000/);
  assert.match(migration, /source\.card->>'text', 1000, 40000/);
  assert.doesNotMatch(migration, /'intro',left\(trim\(coalesce\(item->>'intro'/);
});

test("repair restores only malformed registered guide rich-text fields", () => {
  const first = cloneGuide("what-is-apr-on-a-personal-loan");
  const second = cloneGuide("apr-vs-interest-rate");
  const originalSecond = rateGuide();
  second.intro = second.intro.slice(0, 1000);
  second.blocks![0] = { ...second.blocks![0], text: second.blocks![0].text.slice(0, 1000) };
  const content = {
    template_id: "cashpath",
    pages: [first, second],
    custom_blocks: [{ id: "cashpath-request", kind: "leadsgate_form", leadsgate_aid: "4848", leadsgate_template: "wallet-lines" }],
    seo_title: "Keep SEO",
    layout_order: ["custom:cashpath-request"],
  } as unknown as PublicSiteContent;

  assert.equal(needsCashPathGuideRichTextRepair(content), true);
  const repaired = repairCashPathGuideRichText(content);
  const repairedSecond = repaired.pages?.[1];
  assert.ok(repairedSecond);
  assert.equal(repairedSecond.intro, originalSecond.intro);
  assert.ok(decodeRichText(repairedSecond.intro));
  assert.equal(repairedSecond.blocks?.[0].text, originalSecond.blocks?.[0].text);
  assert.equal(repaired.pages?.[0], first);
  assert.equal(repaired.custom_blocks, content.custom_blocks);
  assert.equal(repaired.seo_title, content.seo_title);
  assert.equal(repaired.layout_order, content.layout_order);
  assert.equal(repairCashPathGuideRichText(repaired), repaired);
  assert.equal(needsCashPathGuideRichTextRepair(repaired), false);
});

test("repair leaves valid user-edited registered guides and unrelated templates untouched", () => {
  const second = cloneGuide("apr-vs-interest-rate");
  const userIntro = encodeRichText({
    version: 1,
    root: { type: "root", children: [{ type: "p", children: [{ type: "text", text: "User edited this intro." }] }] },
  });
  second.intro = userIntro;
  const validCashPath = { template_id: "cashpath", pages: [second] } as unknown as PublicSiteContent;
  assert.equal(needsCashPathGuideRichTextRepair(validCashPath), false);
  assert.equal(repairCashPathGuideRichText(validCashPath), validCashPath);

  const nonCashPath = { ...validCashPath, template_id: "gloss-nail-studio" } as PublicSiteContent;
  assert.equal(needsCashPathGuideRichTextRepair(nonCashPath), false);
  assert.equal(repairCashPathGuideRichText(nonCashPath), nonCashPath);
  assert.equal(aprGuide().intro, CASH_PATH_GUIDES[0].intro);
});

test("editor round-trip comparison retains full serialized rich text", async () => {
  const editor = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(editor, /if \(isRichTextValue\(text\)\) return text;/);
  assert.match(editor, /intro: normalizedText\(source\.intro, 1000\)/);
  assert.match(editor, /text: normalizedText\(source\.text, 4000\)/);
  assert.match(editor, /<PublicRichText value=\{page\.intro\}/);
});

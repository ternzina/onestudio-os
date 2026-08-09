import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("OneStudio owns the only active Design and SEO dialog implementations", async () => {
  const [controller, dialogs, runtime, premium] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/OneStudioSystemDialogs.tsx"),
    read("../components/admin/TemplateEditorRuntime.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
  ]);

  assert.equal((dialogs.match(/export function OneStudioDesignDialog/g) ?? []).length, 1);
  assert.equal((dialogs.match(/export function OneStudioSeoDialog/g) ?? []).length, 1);
  assert.match(dialogs, /activeDesigns\.map/);
  assert.match(dialogs, /seo_title/);
  assert.match(dialogs, /seo_description/);
  assert.match(dialogs, /seo_image_url/);
  assert.match(dialogs, /seo_no_index/);
  assert.match(dialogs, /MediaLibraryPicker/);
  assert.equal((controller.match(/<OneStudioDesignDialog/g) ?? []).length, 1);
  assert.equal((controller.match(/<OneStudioSeoDialog/g) ?? []).length, 1);
  assert.match(controller, /const \[designDialogOpen, setDesignDialogOpen\]/);
  assert.match(controller, /const \[seoDialogOpen, setSeoDialogOpen\]/);
  assert.equal((controller.match(/onOpenDesign=\{\(\) => setDesignDialogOpen\(true\)\}/g) ?? []).length, 2);
  assert.equal((controller.match(/onOpenSeo=\{\(\) => setSeoDialogOpen\(true\)\}/g) ?? []).length, 2);
  assert.match(runtime, /commandModel\.design/);
  assert.match(runtime, /commandModel\.seo/);
  assert.doesNotMatch(premium, /designOpen|seoOpen|role="dialog"|aria-modal/);
  const visualBuilder = controller.slice(controller.indexOf("function VisualBuilder"));
  assert.doesNotMatch(visualBuilder, /templatesOpen|seoOpen|<OneStudioDesignDialog|<OneStudioSeoDialog/);
});

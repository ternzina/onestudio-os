"use client";

import MediaListEditor from "@/components/admin/MediaListEditor";
import SiteEditorMediaField from "@/components/admin/SiteEditorMediaField";
import SiteEditorTextField from "@/components/admin/SiteEditorTextField";
import TypographyControls from "@/components/admin/TypographyControls";
import { EditorToggle, editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { ONESTUDIO_INSPECTOR_GROUPS, type EditorInspectorField, type EditorInspectorModel, type OneStudioInspectorGroup } from "@/lib/public-site/editor-spec";

export function SharedEditorInspectorField({ field }: { field: EditorInspectorField }) {
  if (field.type === "composition") return <div data-editor-composition-field>{field.editor}</div>;
  if (field.type === "custom") return <div data-editor-custom-field>{field.customContent}</div>;
  if (field.type === "mediaList") return <MediaListEditor items={field.items} disabled={field.disabled ?? false} minItems={field.minItems} maxItems={field.maxItems} onChange={field.onChange} onChoose={field.onChoose} />;
  if (field.type === "media") return <SiteEditorMediaField label={field.label} value={field.value} originalValue={field.originalValue} disabled={field.disabled} onChange={field.onChange} onChoose={field.onChoose} />;
  if (field.type === "toggle") return <EditorToggle label={field.label} checked={field.checked} disabled={field.disabled} onChange={field.onChange} />;
  if (field.type === "richText") return <SiteEditorTextField label={field.label} value={field.value} originalValue={field.originalValue} disabled={field.disabled ?? false} richText onChange={field.onChange} />;
  if (field.type === "typography") return <TypographyControls title={field.title} description={field.description} value={field.value} disabled={field.disabled ?? false} onChange={field.onChange} />;
  if (field.type === "button") return <button type="button" disabled={field.disabled} onClick={field.onClick} className={field.tone === "quiet" ? "text-left text-[10px] font-semibold text-[#716d65] underline disabled:opacity-40" : "rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold disabled:opacity-40"}>{field.label}</button>;
  if (field.type === "notice") return <p className="text-[11px] leading-5 text-[#716d65]">{field.text}</p>;
  if (field.type === "select") return <label className="text-xs font-semibold text-[#4f4b45]">{field.label}<select className={editorCompactFieldClass} value={field.value} disabled={field.disabled} onChange={event => field.onChange(event.target.value)}>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === "textarea") return <SiteEditorTextField label={field.label} value={field.value} originalValue={field.originalValue} disabled={field.disabled} multiline rows={field.rows ?? 3} onChange={field.onChange} />;
  if (field.type === "text") return <SiteEditorTextField label={field.label} value={field.value} originalValue={field.originalValue} disabled={field.disabled} onChange={field.onChange} />;
  return <label className="text-xs font-semibold text-[#4f4b45]">{field.label}<input type={field.type} className={editorCompactFieldClass} value={field.value} disabled={field.disabled} onChange={event => field.onChange(event.target.value)} /></label>;
}

export function SharedEditorFieldList({ fields }: { fields: readonly EditorInspectorField[] }) {
  return <div className="grid gap-4">{fields.map(field => <SharedEditorInspectorField key={field.id} field={field} />)}</div>;
}

export default function SharedEditorInspector({ model }: { model: EditorInspectorModel }) {
  const { t } = useAdminI18n();
  const labels: Record<OneStudioInspectorGroup, string> = {
    content: t("Content and appearance"),
    typography: t("Typography"),
    media: t("Block media"),
    layout: t("Size and position"),
  };
  return <div data-shared-editor-inspector>
    <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{model.heading}</p>{model.onCollapse ? <button type="button" onClick={model.onCollapse} className="rounded-lg border border-black/10 px-2 py-1.5 text-[10px] font-semibold text-[#716d65] transition hover:bg-[#f6f4ef]" aria-label={t("Collapse settings")}>{t("Collapse")} →</button> : null}</div>
    <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">{model.title}</h2>
    {model.description ? <p className="mt-1 text-xs leading-5 text-[#716d65]">{model.description}</p> : null}
    <div data-editor-inspector-groups className="mt-6 grid gap-5">{ONESTUDIO_INSPECTOR_GROUPS.map(group => {
      const fields = model.fields.filter(field => field.group === group);
      return fields.length ? <section key={group} data-editor-inspector-group={group} className="rounded-2xl border border-black/8 bg-[#faf9f6] p-4"><h3 className="mb-3 text-xs font-semibold text-[#292722]">{labels[group]}</h3><SharedEditorFieldList fields={fields} /></section> : null;
    })}</div>
    {model.actions?.length ? <div data-editor-inspector-actions className="mt-5 grid gap-2 border-t border-black/8 pt-4">{model.actions.map(action => <button key={action.id} type="button" disabled={action.disabled} onClick={action.onClick} className={action.tone === "danger" ? "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40" : "rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40"}>{action.label}</button>)}</div> : null}
  </div>;
}

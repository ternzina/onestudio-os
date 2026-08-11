import type { AdminMessage, AdminMessageValues } from "@/lib/i18n/admin";
import type { EditorInspectorField } from "@/lib/public-site/editor-spec";
import type {
  PublicSiteCustomBlock,
  PublicSiteMediaLayoutSettings,
  PublicSiteMediaPosition,
} from "@/lib/public-site/types";

type Translate = (message: AdminMessage, values?: AdminMessageValues) => string;

export type MediaLayoutControlCapabilities = {
  size?: boolean;
  aspect?: boolean;
  height?: boolean;
  fit?: boolean;
  frame?: boolean;
  radius?: boolean;
  focalPoint?: boolean;
  opacity?: boolean;
  overlay?: boolean;
  placement?: "split" | "align";
  responsive?: boolean;
  multiMedia?: boolean;
};

type MediaLayoutInspectorOptions = {
  value: PublicSiteMediaLayoutSettings & { media_position?: PublicSiteMediaPosition };
  capabilities: MediaLayoutControlCapabilities;
  disabled: boolean;
  t: Translate;
  idPrefix?: string;
  onChange: (key: keyof (PublicSiteMediaLayoutSettings & { media_position?: PublicSiteMediaPosition }), value: unknown) => void;
};

const selectOptions = (t: Translate, values: readonly (readonly [string, AdminMessage])[]) =>
  values.map(([value, label]) => ({ value, label: t(label) }));

const clamp = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Math.min(100, Math.max(0, Number.isFinite(parsed) ? parsed : fallback));
};

export function buildBlockLayoutInspectorFields({
  value,
  disabled,
  t,
  idPrefix = "block-layout",
  onChange,
}: {
  value: PublicSiteCustomBlock;
  disabled: boolean;
  t: Translate;
  idPrefix?: string;
  onChange: (key: keyof PublicSiteCustomBlock, value: unknown) => void;
}): EditorInspectorField[] {
  const id = (suffix: string) => `${idPrefix}-${suffix}`;
  const fields: EditorInspectorField[] = [
    { id: id("width"), type: "select", label: t("Content width"), value: value.content_width ?? "wide", disabled, options: selectOptions(t, [["full", "Full width"], ["wide", "Wide"], ["medium", "Medium"], ["narrow", "Narrow"]]), onChange: next => onChange("content_width", next) },
    { id: id("padding-top"), type: "select", label: t("Top spacing"), value: value.padding_top ?? "normal", disabled, options: selectOptions(t, [["none", "None"], ["compact", "Small"], ["normal", "Normal"], ["airy", "Airy"]]), onChange: next => onChange("padding_top", next) },
    { id: id("padding-bottom"), type: "select", label: t("Bottom spacing"), value: value.padding_bottom ?? "normal", disabled, options: selectOptions(t, [["none", "None"], ["compact", "Small"], ["normal", "Normal"], ["airy", "Airy"]]), onChange: next => onChange("padding_bottom", next) },
    { id: id("height"), type: "select", label: t("Minimum height"), value: value.section_height ?? "auto", disabled, options: selectOptions(t, [["auto", "Fit content"], ["compact", "Low"], ["medium", "Medium"], ["tall", "Tall"], ["screen", "Almost full screen"]]), onChange: next => onChange("section_height", next) },
    { id: id("animation"), type: "select", label: t("Animation"), value: value.animation ?? "none", disabled, options: selectOptions(t, [["none", "None"], ["fade", "Fade in"], ["rise", "Rise in"], ["scale", "Scale in"]]), onChange: next => onChange("animation", next) },
  ];
  if (value.animation && value.animation !== "none") fields.push({ id: id("animate-mobile"), type: "toggle", label: t("Animation on phone"), checked: value.animate_on_mobile !== false, disabled, onChange: next => onChange("animate_on_mobile", next) });
  return fields;
}

/** One field vocabulary shared by Standard, Premium, and system backgrounds. */
export function buildMediaLayoutInspectorFields({
  value,
  capabilities,
  disabled,
  t,
  idPrefix = "media",
  onChange,
}: MediaLayoutInspectorOptions): EditorInspectorField[] {
  const fields: EditorInspectorField[] = [];
  const id = (suffix: string) => `${idPrefix}-${suffix}`;

  if (capabilities.placement) {
    const options = capabilities.placement === "align"
      ? selectOptions(t, [["left", "Left"], ["center", "Center"], ["right", "Right"]])
      : selectOptions(t, [["left", "Image + text"], ["right", "Text + image"]]);
    fields.push({
      id: id("position"),
      type: "select",
      label: t("Image position"),
      value: value.media_position ?? (capabilities.placement === "align" ? "center" : "right"),
      disabled,
      options,
      onChange: next => onChange("media_position", next === "left" || next === "center" ? next : "right"),
    });
  }
  if (capabilities.size) fields.push({
    id: id("size"), type: "select", label: t("Media size"), value: value.media_size ?? "wide", disabled,
    options: selectOptions(t, [["full", "Full width"], ["wide", "Large"], ["medium", "Medium"], ["compact", "Small"]]),
    onChange: next => onChange("media_size", next),
  });
  if (capabilities.aspect) fields.push({
    id: id("aspect"), type: "select", label: t("Proportions"), value: value.media_aspect ?? "landscape", disabled,
    options: [["landscape", "16:9"], ["classic", "4:3"], ["square", "1:1"], ["portrait", "4:5"]].map(([optionValue, label]) => ({ value: optionValue, label })),
    onChange: next => onChange("media_aspect", next),
  });
  if (capabilities.height) fields.push({
    id: id("height"), type: "select", label: t("Media height"), value: value.media_height ?? "auto", disabled,
    options: selectOptions(t, [["auto", "Fit content"], ["compact", "Low"], ["medium", "Medium"], ["tall", "Tall"]]),
    onChange: next => onChange("media_height", next),
  });
  if (capabilities.fit) fields.push({
    id: id("fit"), type: "select", label: t("Image fit"), value: value.media_fit ?? "cover", disabled,
    options: selectOptions(t, [["cover", "Fill"], ["contain", "Whole image"]]),
    onChange: next => onChange("media_fit", next),
  });
  if (capabilities.focalPoint) fields.push(
    { id: id("focal-x"), type: "number", label: `${t("Focal point X")} · %`, value: value.media_focal_x ?? 50, disabled, onChange: next => onChange("media_focal_x", clamp(next, 50)) },
    { id: id("focal-y"), type: "number", label: `${t("Focal point Y")} · %`, value: value.media_focal_y ?? 50, disabled, onChange: next => onChange("media_focal_y", clamp(next, 50)) },
  );
  if (capabilities.frame) fields.push({
    id: id("frame"), type: "select", label: t("Frame"), value: value.media_frame ?? "line", disabled,
    options: selectOptions(t, [["none", "None"], ["line", "Line"], ["card", "Card with shadow"]]),
    onChange: next => onChange("media_frame", next),
  });
  if (capabilities.radius) fields.push({
    id: id("radius"), type: "select", label: t("Corner radius"), value: value.media_radius ?? "soft", disabled,
    options: selectOptions(t, [["none", "None"], ["soft", "Soft corners"], ["rounded", "Rounded corners"], ["pill", "Pill"]]),
    onChange: next => onChange("media_radius", next),
  });
  if (capabilities.opacity) fields.push({
    id: id("opacity"), type: "number", label: `${t("Image opacity")} · %`, value: value.media_opacity ?? 100, disabled,
    onChange: next => onChange("media_opacity", clamp(next, 100)),
  });
  if (capabilities.overlay) fields.push({
    id: id("overlay"), type: "number", label: `${t("Overlay strength")} · %`, value: value.media_overlay ?? 0, disabled,
    onChange: next => onChange("media_overlay", clamp(next, 0)),
  });
  if (capabilities.multiMedia) fields.push(
    {
      id: id("columns"), type: "select", label: t("Images per row"), value: String(value.media_columns ?? 4), disabled,
      options: selectOptions(t, [["2", "Two columns"], ["3", "Three columns"], ["4", "Four columns"]]),
      onChange: next => onChange("media_columns", next === "2" ? 2 : next === "3" ? 3 : 4),
    },
    {
      id: id("gap"), type: "select", label: t("Gap"), value: value.media_gap ?? "normal", disabled,
      options: selectOptions(t, [["none", "None"], ["compact", "Tight"], ["normal", "Comfortable"], ["airy", "Wide gap"]]),
      onChange: next => onChange("media_gap", next),
    },
  );

  if (capabilities.responsive) {
    if (capabilities.fit) fields.push({
      id: id("mobile-fit"), type: "select", label: `${t("Mobile media")} · ${t("Image fit")}`, value: value.media_mobile_fit ?? "inherit", disabled,
      options: selectOptions(t, [["inherit", "Same as desktop"], ["cover", "Fill"], ["contain", "Whole image"]]),
      onChange: next => onChange("media_mobile_fit", next === "cover" || next === "contain" ? next : undefined),
    });
    if (capabilities.aspect) fields.push({
      id: id("mobile-aspect"), type: "select", label: `${t("Mobile media")} · ${t("Proportions")}`, value: value.media_mobile_aspect ?? "inherit", disabled,
      options: [{ value: "inherit", label: t("Same as desktop") }, ...[["landscape", "16:9"], ["classic", "4:3"], ["square", "1:1"], ["portrait", "4:5"]].map(([optionValue, label]) => ({ value: optionValue, label }))],
      onChange: next => onChange("media_mobile_aspect", next === "inherit" ? undefined : next),
    });
    if (capabilities.height) fields.push({
      id: id("mobile-height"), type: "select", label: `${t("Mobile media")} · ${t("Media height")}`, value: value.media_mobile_height ?? "inherit", disabled,
      options: selectOptions(t, [["inherit", "Same as desktop"], ["auto", "Fit content"], ["compact", "Low"], ["medium", "Medium"], ["tall", "Tall"]]),
      onChange: next => onChange("media_mobile_height", next === "inherit" ? undefined : next),
    });
    if (capabilities.focalPoint) fields.push(
      { id: id("mobile-focal-x"), type: "number", label: `${t("Mobile media")} · ${t("Focal point X")} · %`, value: value.media_mobile_focal_x ?? value.media_focal_x ?? 50, disabled, onChange: next => onChange("media_mobile_focal_x", clamp(next, value.media_focal_x ?? 50)) },
      { id: id("mobile-focal-y"), type: "number", label: `${t("Mobile media")} · ${t("Focal point Y")} · %`, value: value.media_mobile_focal_y ?? value.media_focal_y ?? 50, disabled, onChange: next => onChange("media_mobile_focal_y", clamp(next, value.media_focal_y ?? 50)) },
    );
    if (capabilities.placement === "split") fields.push({
      id: id("mobile-position"), type: "select", label: `${t("Mobile media")} · ${t("Image position")}`, value: value.media_mobile_position ?? "after", disabled,
      options: selectOptions(t, [["before", "Before text"], ["after", "After text"]]),
      onChange: next => onChange("media_mobile_position", next === "before" ? "before" : "after"),
    });
    if (capabilities.multiMedia) fields.push({
      id: id("mobile-columns"), type: "select", label: `${t("Mobile media")} · ${t("Images per row")}`, value: String(value.media_mobile_columns ?? 2), disabled,
      options: selectOptions(t, [["1", "One column"], ["2", "Two columns"]]),
      onChange: next => onChange("media_mobile_columns", next === "1" ? 1 : 2),
    });
  }

  return fields;
}

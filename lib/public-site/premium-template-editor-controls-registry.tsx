import type { ReactNode } from "react";
import GlossNativeSectionControls from "../../components/admin/gloss/GlossNativeSectionControls";
import type { PremiumTemplateEditorMediaTarget } from "./premium-template-editor-adapter";
import type { PublicSiteContent, PublicSiteProject, PublicSiteService } from "./types";

export type PremiumTemplateEditorControlInput = {
  templateKey: string;
  sectionId: string;
  content: PublicSiteContent;
  disabled: boolean;
  services: readonly PublicSiteService[];
  portfolio: readonly PublicSiteProject[];
  onChange(content: PublicSiteContent, historyGroup: string): void;
  onChooseMedia(target: PremiumTemplateEditorMediaTarget): void;
};

type ControlRenderer = (input: PremiumTemplateEditorControlInput) => ReactNode;

const controls: Record<string, ControlRenderer> = {
  "gloss-nail-studio": (input) => <GlossNativeSectionControls {...input} sectionId={input.sectionId as Parameters<typeof GlossNativeSectionControls>[0]["sectionId"]} />,
};

export function getPremiumTemplateEditorControl(input: PremiumTemplateEditorControlInput): ReactNode {
  return controls[input.templateKey]?.(input) ?? null;
}

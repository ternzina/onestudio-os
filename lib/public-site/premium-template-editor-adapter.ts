import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type {
  PremiumTemplateContract,
  PremiumTemplateNativeSection,
} from "./premium-template-contract.ts";
import type { PublicSiteContent, PublicSiteCustomBlock } from "./types.ts";

export type PremiumEditorSectionMetadata = PremiumTemplateNativeSection & {
  token: string;
  pinned: boolean;
};

export type PremiumTemplateEditorAdapter<SectionId extends string = string> = {
  templateKey: string;
  contract: PremiumTemplateContract<string, SectionId>;
  initialSectionId: SectionId;
  nativeToken(sectionId: SectionId): string;
  nativeSectionId(token: string): SectionId | null;
  normalizeLayout(tokens: readonly string[], customBlockIds: readonly string[]): string[];
  moveLayoutItem(input: {
    tokens: readonly string[];
    customBlockIds: readonly string[];
    fromIndex: number;
    toIndex: number;
  }): string[];
  isSectionVisible(content: PublicSiteContent, sectionId: SectionId): boolean;
  setSectionVisibility(content: PublicSiteContent, sectionId: SectionId, visible: boolean): PublicSiteContent;
  resetSection(content: PublicSiteContent, sectionId: SectionId): PublicSiteContent;
  restoreTemplate(content: PublicSiteContent): PublicSiteContent;
  buildInspectorFields(input: {
    content: PublicSiteContent;
    sectionId: SectionId;
    disabled: boolean;
    onChange(content: PublicSiteContent, historyGroup: string): void;
  }): EditorInspectorPlacedField[];
  insertCustomBlock(content: PublicSiteContent, block: PublicSiteCustomBlock): PublicSiteContent;
  history: {
    layout: string;
    visibility(sectionId: SectionId): string;
    reset(sectionId: SectionId): string;
    restore: string;
  };
};

export function getPremiumEditorSection<SectionId extends string>(
  adapter: PremiumTemplateEditorAdapter<SectionId>,
  sectionId: string,
): PremiumTemplateNativeSection<SectionId> | undefined {
  return adapter.contract.nativeSections.find((section) => section.id === sectionId);
}

export function isPremiumEditorSectionId<SectionId extends string>(
  adapter: PremiumTemplateEditorAdapter<SectionId>,
  sectionId: string,
): sectionId is SectionId {
  return getPremiumEditorSection(adapter, sectionId) !== undefined;
}

export function getPremiumEditorSectionByAnchor<SectionId extends string>(
  adapter: PremiumTemplateEditorAdapter<SectionId>,
  anchor: string,
): PremiumTemplateNativeSection<SectionId> | undefined {
  return adapter.contract.nativeSections.find((section) => section.anchor === anchor);
}

export function getPremiumEditorSectionMetadata<SectionId extends string>(
  adapter: PremiumTemplateEditorAdapter<SectionId>,
  sectionId: string,
): PremiumEditorSectionMetadata | undefined {
  const section = getPremiumEditorSection(adapter, sectionId);
  return section ? { ...section, token: adapter.nativeToken(section.id), pinned: section.pinning !== undefined } : undefined;
}

export function getPremiumEditorNavigationMetadata<SectionId extends string>(
  adapter: PremiumTemplateEditorAdapter<SectionId>,
): PremiumEditorSectionMetadata[] {
  return [...adapter.contract.nativeSections]
    .sort((a, b) => a.defaultOrder - b.defaultOrder)
    .map((section) => ({
      ...section,
      token: adapter.nativeToken(section.id),
      pinned: section.pinning !== undefined,
    }));
}

export function canMovePremiumEditorLayoutItem<SectionId extends string>(
  adapter: PremiumTemplateEditorAdapter<SectionId>,
  input: { tokens: readonly string[]; customBlockIds: readonly string[]; fromIndex: number; direction: -1 | 1 },
): boolean {
  const normalized = adapter.normalizeLayout(input.tokens, input.customBlockIds);
  const moved = adapter.moveLayoutItem({ ...input, toIndex: input.fromIndex + input.direction });
  return moved.some((token, index) => token !== normalized[index]);
}

export function visibilityAfterPremiumEditorReset(
  section: PremiumTemplateNativeSection,
  currentVisibility: boolean,
): boolean {
  if (section.visibilityAfterReset === "visible") return true;
  if (section.visibilityAfterReset === "hidden") return false;
  return currentVisibility;
}

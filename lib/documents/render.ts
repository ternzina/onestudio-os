export function renderDocumentTemplate(template: string, variables: Record<string, string | number | null | undefined>) {
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value == null ? "" : String(value)),
    template,
  );
}

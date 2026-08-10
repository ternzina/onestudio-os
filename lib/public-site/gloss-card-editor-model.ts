export type GlossCard = Record<string, string>;
export type GlossCardModel = { delimiter: string; fields: readonly string[]; defaults: GlossCard };

export function parseGlossCards(value: string, model: GlossCardModel): GlossCard[] {
  return value.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
    const cells = line.split(model.delimiter).map(cell => cell.trim());
    return Object.fromEntries(model.fields.map((field, index) => [field, cells[index] ?? ""]));
  });
}

export function serializeGlossCards(cards: readonly GlossCard[], model: GlossCardModel): string {
  return cards.map(card => model.fields.map(field => (card[field] ?? "").replace(/\n+/g, " ").trim()).join(` ${model.delimiter} `)).join("\n");
}

export function mutateGlossIndexedCards(input: {
  items: string; images?: readonly string[]; model: GlossCardModel;
  action: { type: "add" } | { type: "remove"; index: number } | { type: "move"; index: number; to: number } | { type: "update"; index: number; field: string; value: string };
}) {
  const cards = parseGlossCards(input.items, input.model).map((card, index) => ({ ...card, __image: input.images?.[index] ?? "" }));
  const { action } = input;
  if (action.type === "add") cards.push({ ...input.model.defaults, __image: "" });
  if (action.type === "remove") cards.splice(action.index, 1);
  if (action.type === "move" && cards[action.index] && action.to >= 0 && action.to < cards.length) {
    const [card] = cards.splice(action.index, 1); cards.splice(action.to, 0, card);
  }
  if (action.type === "update" && cards[action.index]) cards[action.index] = { ...cards[action.index], [action.field]: action.value };
  return { items: serializeGlossCards(cards, input.model), images: input.images ? cards.map(card => card.__image) : undefined };
}

export function glossIndexedMediaTarget(key: "team_image_urls" | "membership_image_urls" | "gift_image_urls", index: number, label: string) {
  return { kind: "list" as const, key, index, label };
}

export function setGlossServiceCardImage<T extends { service_card_images?: Record<string, string> }>(content: T, slug: string, url: string): T {
  return { ...content, service_card_images: { ...(content.service_card_images ?? {}), [slug]: url } };
}

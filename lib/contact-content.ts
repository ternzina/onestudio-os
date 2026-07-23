export type ContactSettings = {
  phone: string;
  email: string;
  address: string;
  hours_uk: string;
  hours_pl: string;
  google_maps_query: string;
  nip: string;
  transfer_recipient: string;
  transfer_title_uk: string;
  transfer_title_pl: string;
  bank_account: string;
  blik: string;
  instagram: string;
  instagram_url: string;
};

export const fallbackContacts: ContactSettings = {
  phone: "",
  email: "hello@onestudioos.com",
  address: "",
  hours_uk: "Щодня 09:00 – 21:00",
  hours_pl: "Codziennie 09:00 – 21:00",
  google_maps_query: "",
  nip: "",
  transfer_recipient: "",
  transfer_title_uk: "зал, дата, година",
  transfer_title_pl: "sala, data, godzina",
  bank_account: "",
  blik: "",
  instagram: "",
  instagram_url: "",
};

export function normalizeContactSettings(
  row: Partial<ContactSettings> | null,
): ContactSettings {
  return Object.fromEntries(
    Object.entries(fallbackContacts).map(([key, fallbackValue]) => {
      const value = row?.[key as keyof ContactSettings];
      return [key, typeof value === "string" && value.trim() ? value.trim() : fallbackValue];
    }),
  ) as ContactSettings;
}

export type CompanyProfile = {
  business_id: string;
  display_name: string;
  legal_name: string;
  entity_type: "sole_proprietor" | "company" | "individual" | "nonprofit" | "other";
  owner_name: string;
  tax_id: string;
  registration_id: string;
  vat_number: string;
  email: string;
  support_email: string;
  phone: string;
  website_url: string;
  country_code: string;
  default_currency: string;
  timezone: string;
  address: string;
  bank_name: string;
  iban: string;
  swift_bic: string;
  logo_url: string;
};

export const emptyCompanyProfile: Omit<CompanyProfile, "business_id"> = {
  display_name: "OneStudio OS",
  legal_name: "ФОП Тернавська Зінаїда Рахілівна",
  entity_type: "sole_proprietor",
  owner_name: "Тернавська Зінаїда Рахілівна",
  tax_id: "2011300180",
  registration_id: "2011300180",
  vat_number: "",
  email: "hello@onestudioos.com",
  support_email: "hello@onestudioos.com",
  phone: "",
  website_url: "https://onestudioos.com",
  country_code: "UA",
  default_currency: "UAH",
  timezone: "Europe/Kyiv",
  address: "",
  bank_name: "АТ КБ «ПРИВАТБАНК»",
  iban: "UA663052990000026005016008890",
  swift_bic: "",
  logo_url: "",
};

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
  display_name: "",
  legal_name: "",
  entity_type: "sole_proprietor",
  owner_name: "",
  tax_id: "",
  registration_id: "",
  vat_number: "",
  email: "",
  support_email: "",
  phone: "",
  website_url: "",
  country_code: "UA",
  default_currency: "UAH",
  timezone: "Europe/Kyiv",
  address: "",
  bank_name: "",
  iban: "",
  swift_bic: "",
  logo_url: "",
};

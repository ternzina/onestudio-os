export const CORE_MODULE_KEYS = [
  "core",
  "media",
  "portfolio",
  "catalog",
  "scheduling",
  "crm",
  "payments",
  "notifications",
  "analytics",
] as const;

export type CoreModuleKey = (typeof CORE_MODULE_KEYS)[number];
export type CoreModuleStage = "enabled" | "contract-ready" | "planned";

export type BusinessRole = "owner" | "admin" | "staff" | "viewer";
export type BusinessStatus = "active" | "suspended" | "archived";

export type ServiceKind =
  | "appointment"
  | "rental"
  | "class"
  | "event"
  | "membership"
  | "other";

export type PricingModel = "fixed" | "per_hour" | "per_person" | "free" | "quote";

export type ResourceKind = "staff" | "space" | "equipment" | "seat" | "asset" | "other";

export type BookingStatus =
  | "draft"
  | "hold"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingSource = "public" | "admin" | "import" | "api";
export type PaymentStatus = "not_required" | "pending" | "partially_paid" | "paid" | "refunded" | "failed";

export type BusinessRecord = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  default_locale: string;
  default_currency: string;
  status: BusinessStatus;
};

export type ClientRecord = {
  id: string;
  business_id: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  locale: string;
  notes: string;
  tags: string[];
};

export type ServiceRecord = {
  id: string;
  business_id: string;
  slug: string;
  kind: ServiceKind;
  title: string;
  description: string;
  pricing_model: PricingModel;
  price_minor: number | null;
  currency: string;
  duration_min_minutes: number | null;
  duration_max_minutes: number | null;
  duration_step_minutes: number | null;
  capacity: number;
  is_public: boolean;
  is_active: boolean;
};

export type ResourceRecord = {
  id: string;
  business_id: string;
  slug: string;
  kind: ResourceKind;
  name: string;
  capacity: number;
  is_bookable: boolean;
  is_active: boolean;
};

export type BookingRecord = {
  id: string;
  business_id: string;
  reference: string;
  client_id: string;
  service_id: string;
  status: BookingStatus;
  source: BookingSource;
  starts_at: string;
  ends_at: string;
  timezone: string;
  locale: string;
  party_size: number;
  subtotal_minor: number;
  discount_minor: number;
  total_minor: number;
  currency: string;
  payment_status: PaymentStatus;
};

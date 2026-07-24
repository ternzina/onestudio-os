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

export type BusinessRole = "owner" | "admin" | "manager" | "staff" | "viewer";
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

export type CatalogCategoryKind = "service" | "resource";

export type CatalogCategoryRecord = {
  id: string;
  business_id: string;
  kind: CatalogCategoryKind;
  slug: string;
  name: string;
  description: string;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

export type AvailabilityExceptionKind = "available" | "blocked";

export type BusinessAvailabilitySettingsRecord = {
  business_id: string;
  minimum_notice_minutes: number;
  booking_horizon_days: number;
  slot_interval_minutes: number;
};

export type AvailabilityRuleRecord = {
  id: string;
  business_id: string;
  resource_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  effective_from: string | null;
  effective_until: string | null;
  is_active: boolean;
};

export type AvailabilityExceptionRecord = {
  id: string;
  business_id: string;
  resource_id: string;
  kind: AvailabilityExceptionKind;
  starts_at: string;
  ends_at: string;
  reason: string;
};

export type AvailableSlotRecord = {
  starts_at: string;
  ends_at: string;
  local_start_time: string;
  local_end_time: string;
  timezone: string;
};

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
export type BookingEventType = "created" | "updated" | "status_changed" | "cancelled";

export type BusinessRecord = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  default_locale: string;
  default_currency: string;
  status: BusinessStatus;
};

export type BusinessMembershipRecord = {
  business_id: string;
  user_id: string;
  role: BusinessRole;
  is_active: boolean;
  is_default: boolean;
};

export type BusinessWorkspaceSummary = Omit<BusinessRecord, "id"> & {
  business_id: string;
  role: BusinessRole;
  is_default: boolean;
  member_since: string;
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
  category_id: string | null;
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
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  capacity: number;
  requires_confirmation: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

export type ResourceRecord = {
  id: string;
  business_id: string;
  category_id: string | null;
  slug: string;
  kind: ResourceKind;
  name: string;
  description: string;
  capacity: number;
  timezone: string | null;
  is_bookable: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
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
  customer_notes: string;
  internal_notes: string;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string;
};

export type BookingAllocationRecord = {
  id: string;
  business_id: string;
  booking_id: string;
  resource_id: string;
  status: "held" | "confirmed" | "released";
  starts_at: string;
  ends_at: string;
  quantity: number;
};

export type BookingEventRecord = {
  id: string;
  business_id: string;
  booking_id: string;
  event_type: BookingEventType;
  actor_user_id: string | null;
  previous_status: string | null;
  new_status: string | null;
  changes: Record<string, unknown>;
  created_at: string;
};

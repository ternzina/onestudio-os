export type DomainStatus =
  | "pending"
  | "verification_required"
  | "dns_pending"
  | "active"
  | "error";

export type DomainDnsRecord = {
  type: "A" | "CNAME" | "TXT";
  name: string;
  value: string;
  purpose: "routing" | "verification" | "redirect";
};

export type DomainVerification = {
  type: string;
  domain: string;
  value: string;
  reason?: string;
};

export type ClientDomainRecord = {
  id: string;
  business_id: string;
  domain: string;
  redirect_domain: string | null;
  status: DomainStatus;
  ownership_verification_required: boolean;
  vercel_verified: boolean;
  dns_configured: boolean;
  ssl_ready: boolean;
  verification: DomainVerification[];
  dns_records: DomainDnsRecord[];
  last_error: string | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientDomainBusiness = {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
};

export type ClientDomainPayload = {
  ok: true;
  business: ClientDomainBusiness;
  domain: ClientDomainRecord | null;
};

export type ClientDomainErrorPayload = {
  ok: false;
  error: string;
  message: string;
};

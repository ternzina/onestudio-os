import type {
  DomainDnsRecord,
  DomainStatus,
  DomainVerification,
} from "@/lib/domains/types";

export type VercelDomainSyncResult = {
  domain: string;
  redirectDomain: string | null;
  status: DomainStatus;
  ownershipVerificationRequired: boolean;
  vercelVerified: boolean;
  dnsConfigured: boolean;
  sslReady: boolean;
  verification: DomainVerification[];
  dnsRecords: DomainDnsRecord[];
  lastError: string | null;
};

type ProjectDomain = {
  name?: string;
  apexName?: string;
  verified?: boolean;
  verification?: Array<{
    type?: string;
    domain?: string;
    value?: string;
    reason?: string;
  }>;
};

type DomainConfig = {
  configuredBy?: string | null;
  misconfigured?: boolean;
  recommendedIPv4?: Array<{
    rank?: number;
    value?: string[];
  }>;
  recommendedCNAME?: Array<{
    rank?: number;
    value?: string;
  }>;
};

type OwnershipVerification = {
  txtRecord?: string;
  verificationDomain?: string;
};

class VercelApiError extends Error {
  status: number;
  code: string | null;

  constructor(status: number, message: string, code?: string | null) {
    super(message);
    this.name = "VercelApiError";
    this.status = status;
    this.code = code ?? null;
  }
}

function requiredConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.ONESTUDIO_VERCEL_PROJECT_ID;
  const teamId = process.env.ONESTUDIO_VERCEL_TEAM_ID;

  if (!token || !projectId || !teamId) {
    throw new Error("client_domain_not_configured");
  }

  return { token, projectId, teamId };
}

async function vercelRequest<T>(
  pathname: string,
  init: RequestInit = {},
): Promise<T> {
  const { token } = requiredConfig();
  const response = await fetch(`https://api.vercel.com${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  const raw = await response.text();
  let payload: unknown = {};

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { message: raw };
    }
  }

  if (!response.ok) {
    const body = payload as {
      error?: { message?: string; code?: string };
      message?: string;
      code?: string;
    };
    throw new VercelApiError(
      response.status,
      body.error?.message || body.message || `Vercel HTTP ${response.status}`,
      body.error?.code || body.code || null,
    );
  }

  return payload as T;
}

function projectDomainPath(domain?: string) {
  const { projectId, teamId } = requiredConfig();
  const base = `/v9/projects/${encodeURIComponent(projectId)}/domains`;
  return `${base}${domain ? `/${encodeURIComponent(domain)}` : ""}?teamId=${encodeURIComponent(teamId)}`;
}

function addProjectDomainPath() {
  const { projectId, teamId } = requiredConfig();
  return `/v10/projects/${encodeURIComponent(projectId)}/domains?teamId=${encodeURIComponent(teamId)}`;
}

async function addProjectDomain(
  domain: string,
  redirect?: string | null,
): Promise<ProjectDomain> {
  return vercelRequest<ProjectDomain>(addProjectDomainPath(), {
    method: "POST",
    body: JSON.stringify({
      name: domain,
      ...(redirect
        ? {
            redirect,
            redirectStatusCode: 308,
          }
        : {}),
    }),
  });
}

async function getProjectDomain(domain: string) {
  try {
    return await vercelRequest<ProjectDomain>(projectDomainPath(domain));
  } catch (error) {
    if (error instanceof VercelApiError && error.status === 404) return null;
    throw error;
  }
}

async function getDomainConfig(domain: string) {
  const { projectId, teamId } = requiredConfig();
  return vercelRequest<DomainConfig>(
    `/v6/domains/${encodeURIComponent(domain)}/config?projectIdOrName=${encodeURIComponent(projectId)}&teamId=${encodeURIComponent(teamId)}&strict=true`,
  );
}

async function getOwnershipVerification(domain: string) {
  const { teamId } = requiredConfig();
  return vercelRequest<OwnershipVerification>(
    `/v9/domains/${encodeURIComponent(domain)}/verification?teamId=${encodeURIComponent(teamId)}`,
  );
}

async function claimDomain(domain: string) {
  const { teamId } = requiredConfig();
  return vercelRequest<Record<string, unknown>>(
    `/v9/domains/${encodeURIComponent(domain)}/claim?teamId=${encodeURIComponent(teamId)}`,
    { method: "POST" },
  );
}

function preferredIpv4(config: DomainConfig) {
  return [...(config.recommendedIPv4 || [])]
    .sort((a, b) => (a.rank || 99) - (b.rank || 99))[0]
    ?.value?.filter(Boolean) || [];
}

function preferredCname(config: DomainConfig) {
  return [...(config.recommendedCNAME || [])]
    .sort((a, b) => (a.rank || 99) - (b.rank || 99))[0]
    ?.value?.trim() || null;
}

function recordName(domain: string, apexName: string) {
  if (domain === apexName) return "@";
  const suffix = `.${apexName}`;
  return domain.endsWith(suffix) ? domain.slice(0, -suffix.length) : domain;
}

function companionDomain(domain: string, apexName: string) {
  if (domain === apexName) return `www.${apexName}`;
  if (domain === `www.${apexName}`) return apexName;
  return null;
}

function normalizeVerification(projectDomain: ProjectDomain) {
  return (projectDomain.verification || [])
    .map((item) => ({
      type: item.type || "TXT",
      domain: item.domain || "",
      value: item.value || "",
      reason: item.reason,
    }))
    .filter((item) => item.domain && item.value);
}

function verificationRecords(
  verification: DomainVerification[],
): DomainDnsRecord[] {
  return verification.map((item) => ({
    type: "TXT",
    name: item.domain,
    value: item.value,
    purpose: "verification",
  }));
}

function routingRecords(
  domain: string,
  apexName: string,
  config: DomainConfig,
  purpose: "routing" | "redirect",
): DomainDnsRecord[] {
  if (domain === apexName) {
    return preferredIpv4(config).map((value) => ({
      type: "A",
      name: "@",
      value,
      purpose,
    }));
  }

  const cname = preferredCname(config);
  return cname
    ? [
        {
          type: "CNAME",
          name: recordName(domain, apexName),
          value: cname,
          purpose,
        },
      ]
    : [];
}

function dedupeRecords(records: DomainDnsRecord[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = `${record.type}|${record.name}|${record.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function ownershipRequiredResult(
  domain: string,
  message: string | null = null,
): Promise<VercelDomainSyncResult> {
  const ownership = await getOwnershipVerification(domain);
  const verificationDomain = ownership.verificationDomain || `_vercel.${domain}`;
  const verification = ownership.txtRecord
    ? [
        {
          type: "TXT",
          domain: verificationDomain,
          value: ownership.txtRecord,
          reason: "Подтверждение владения доменом",
        },
      ]
    : [];

  return {
    domain,
    redirectDomain: null,
    status: "verification_required",
    ownershipVerificationRequired: true,
    vercelVerified: false,
    dnsConfigured: false,
    sslReady: false,
    verification,
    dnsRecords: verificationRecords(verification),
    lastError: message,
  };
}

export async function connectVercelDomain(
  domain: string,
): Promise<VercelDomainSyncResult> {
  try {
    await addProjectDomain(domain);
  } catch (error) {
    if (error instanceof VercelApiError && error.status === 409) {
      const existing = await getProjectDomain(domain);
      if (existing) return inspectVercelDomain(domain, false);
      return ownershipRequiredResult(domain, null);
    }
    throw error;
  }

  return inspectVercelDomain(domain, false);
}

export async function inspectVercelDomain(
  domain: string,
  ownershipVerificationRequired: boolean,
): Promise<VercelDomainSyncResult> {
  if (ownershipVerificationRequired) {
    try {
      await claimDomain(domain);
      await addProjectDomain(domain).catch(async (error) => {
        if (!(error instanceof VercelApiError && error.status === 409)) {
          throw error;
        }
      });
    } catch (error) {
      if (
        error instanceof VercelApiError &&
        [400, 403, 409].includes(error.status)
      ) {
        return ownershipRequiredResult(domain, null);
      }
      throw error;
    }
  }

  let projectDomain = await getProjectDomain(domain);
  if (!projectDomain) {
    try {
      projectDomain = await addProjectDomain(domain);
    } catch (error) {
      if (error instanceof VercelApiError && error.status === 409) {
        return ownershipRequiredResult(domain, null);
      }
      throw error;
    }
  }

  const apexName = projectDomain.apexName || domain;
  const redirectDomain = companionDomain(domain, apexName);
  let redirectProjectDomain: ProjectDomain | null = null;

  if (redirectDomain) {
    redirectProjectDomain = await getProjectDomain(redirectDomain);
    if (!redirectProjectDomain) {
      try {
        redirectProjectDomain = await addProjectDomain(redirectDomain, domain);
      } catch (error) {
        if (!(error instanceof VercelApiError && error.status === 409)) {
          throw error;
        }
      }
    }
  }

  const [config, redirectConfig] = await Promise.all([
    getDomainConfig(domain),
    redirectDomain
      ? getDomainConfig(redirectDomain).catch(() => null)
      : Promise.resolve(null),
  ]);

  const verification = normalizeVerification(projectDomain);
  if (redirectProjectDomain) {
    verification.push(...normalizeVerification(redirectProjectDomain));
  }

  const dnsRecords = dedupeRecords([
    ...verificationRecords(verification),
    ...routingRecords(domain, apexName, config, "routing"),
    ...(redirectDomain && redirectConfig
      ? routingRecords(redirectDomain, apexName, redirectConfig, "redirect")
      : []),
  ]);

  const vercelVerified = projectDomain.verified === true;
  const effectiveRedirectDomain = redirectProjectDomain ? redirectDomain : null;
  const redirectVerified = redirectProjectDomain
    ? redirectProjectDomain.verified === true
    : true;
  const dnsConfigured = config.misconfigured === false;
  const redirectConfigured = redirectConfig
    ? redirectConfig.misconfigured === false
    : true;
  const active =
    vercelVerified && redirectVerified && dnsConfigured && redirectConfigured;

  return {
    domain,
    redirectDomain: effectiveRedirectDomain,
    status: active
      ? "active"
      : !vercelVerified || !redirectVerified
        ? "verification_required"
        : "dns_pending",
    ownershipVerificationRequired: false,
    vercelVerified: vercelVerified && redirectVerified,
    dnsConfigured: dnsConfigured && redirectConfigured,
    sslReady: active,
    verification,
    dnsRecords,
    lastError: null,
  };
}

export async function removeVercelDomain(
  domain: string,
  redirectDomain?: string | null,
) {
  const domains = [domain, redirectDomain].filter(Boolean) as string[];

  for (const item of domains) {
    try {
      await vercelRequest<Record<string, unknown>>(projectDomainPath(item), {
        method: "DELETE",
      });
    } catch (error) {
      if (!(error instanceof VercelApiError && error.status === 404)) {
        throw error;
      }
    }
  }
}

export function vercelDomainError(error: unknown) {
  if (error instanceof VercelApiError) {
    if (error.status === 401) return "vercel_token_invalid";
    if (error.status === 403) return "vercel_domain_forbidden";
    if (error.status === 409) return "vercel_domain_conflict";
    return error.code || "vercel_domain_error";
  }

  if (error instanceof Error) return error.message;
  return "vercel_domain_error";
}

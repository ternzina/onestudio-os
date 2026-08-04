import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { normalizeCustomDomain } from "@/lib/domains/normalize";
import type {
  ClientDomainBusiness,
  ClientDomainPayload,
  ClientDomainRecord,
} from "@/lib/domains/types";
import {
  connectVercelDomain,
  inspectVercelDomain,
  removeVercelDomain,
  vercelDomainError,
  type VercelDomainSyncResult,
} from "@/lib/server/vercel-domains";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type DomainRow = ClientDomainRecord;

type ReplacementPhase = "preparing" | "ready" | "cleanup_pending" | "error";

type ReplacementRow = {
  id: string;
  business_id: string;
  current_domain: string;
  current_redirect_domain: string | null;
  candidate_domain: string;
  candidate_redirect_domain: string | null;
  phase: ReplacementPhase;
  status: DomainRow["status"];
  ownership_verification_required: boolean;
  vercel_verified: boolean;
  dns_configured: boolean;
  ssl_ready: boolean;
  verification: DomainRow["verification"];
  dns_records: DomainRow["dns_records"];
  last_error: string | null;
  last_checked_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type DomainManagementPayload = ClientDomainPayload & {
  replacement: ReplacementRow | null;
  warning?: string;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type SiteSettingsRow = {
  is_published: boolean;
};

type PromotionResult = {
  oldDomain?: string;
  oldRedirectDomain?: string | null;
  domain?: DomainRow;
  replacement?: ReplacementRow;
};

function jsonError(error: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) throw new Error("client_domain_database_unavailable");

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function authorizeBusiness(
  businessId: string,
): Promise<{
  user: { id: string } | null;
  error: "signed_out" | "forbidden" | null;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, error: "signed_out" };

  const { data, error } = await supabase.rpc("can_manage_public_site_domain", {
    p_business_id: businessId,
  });

  if (error || data !== true) return { user: null, error: "forbidden" };
  return { user: { id: user.id }, error: null };
}

async function readBusiness(
  admin: SupabaseClient,
  businessId: string,
): Promise<ClientDomainBusiness | null> {
  const [{ data: business }, { data: settings }] = await Promise.all([
    admin
      .from("businesses")
      .select("id,name,slug,status")
      .eq("id", businessId)
      .maybeSingle(),
    admin
      .from("public_site_settings")
      .select("is_published")
      .eq("business_id", businessId)
      .maybeSingle(),
  ]);

  const businessRow = business as BusinessRow | null;
  const settingsRow = settings as SiteSettingsRow | null;

  if (!businessRow || businessRow.status !== "active") return null;

  return {
    id: businessRow.id,
    name: businessRow.name,
    slug: businessRow.slug,
    isPublished: settingsRow?.is_published === true,
  };
}

async function readDomain(admin: SupabaseClient, businessId: string) {
  const { data, error } = await admin
    .from("public_site_domains")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw error;
  return (data as DomainRow | null) || null;
}

async function readReplacement(admin: SupabaseClient, businessId: string) {
  const { data, error } = await admin
    .from("public_site_domain_replacements")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw error;
  return (data as ReplacementRow | null) || null;
}

function syncUpdate(result: VercelDomainSyncResult) {
  return {
    domain: result.domain,
    redirect_domain: result.redirectDomain,
    status: result.status,
    ownership_verification_required: result.ownershipVerificationRequired,
    vercel_verified: result.vercelVerified,
    dns_configured: result.dnsConfigured,
    ssl_ready: result.sslReady,
    verification: result.verification,
    dns_records: result.dnsRecords,
    last_error: result.lastError,
    last_checked_at: new Date().toISOString(),
  };
}

function replacementSyncUpdate(result: VercelDomainSyncResult) {
  return {
    candidate_domain: result.domain,
    candidate_redirect_domain: result.redirectDomain,
    phase: result.status === "active" ? "ready" : "preparing",
    status: result.status,
    ownership_verification_required: result.ownershipVerificationRequired,
    vercel_verified: result.vercelVerified,
    dns_configured: result.dnsConfigured,
    ssl_ready: result.sslReady,
    verification: result.verification,
    dns_records: result.dnsRecords,
    last_error: result.lastError,
    last_checked_at: new Date().toISOString(),
  };
}

async function saveSyncResult(
  admin: SupabaseClient,
  businessId: string,
  result: VercelDomainSyncResult,
) {
  const { data, error } = await admin
    .from("public_site_domains")
    .update(syncUpdate(result))
    .eq("business_id", businessId)
    .select("*")
    .single();

  if (error) throw error;
  return data as DomainRow;
}

async function saveReplacementSyncResult(
  admin: SupabaseClient,
  businessId: string,
  result: VercelDomainSyncResult,
) {
  const { data, error } = await admin
    .from("public_site_domain_replacements")
    .update(replacementSyncUpdate(result))
    .eq("business_id", businessId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ReplacementRow;
}

async function payloadForBusiness(
  admin: SupabaseClient,
  businessId: string,
  warning?: string,
): Promise<DomainManagementPayload | null> {
  const business = await readBusiness(admin, businessId);
  if (!business) return null;

  const [domain, replacement] = await Promise.all([
    readDomain(admin, businessId),
    readReplacement(admin, businessId),
  ]);

  return {
    ok: true,
    business,
    domain,
    replacement,
    ...(warning ? { warning } : {}),
  };
}

async function domainReservedElsewhere(
  admin: SupabaseClient,
  businessId: string,
  domain: string,
) {
  const [{ data: activeDomain }, { data: replacement }] = await Promise.all([
    admin
      .from("public_site_domains")
      .select("business_id")
      .eq("domain", domain)
      .neq("business_id", businessId)
      .maybeSingle(),
    admin
      .from("public_site_domain_replacements")
      .select("business_id")
      .eq("candidate_domain", domain)
      .neq("business_id", businessId)
      .maybeSingle(),
  ]);

  return Boolean(activeDomain || replacement);
}

async function removeUniqueDomains(
  pairs: Array<{ domain: string; redirectDomain: string | null }>,
) {
  const seen = new Set<string>();

  for (const pair of pairs) {
    const key = `${pair.domain}|${pair.redirectDomain || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    await removeVercelDomain(pair.domain, pair.redirectDomain);
  }
}

async function startReplacement(input: {
  admin: SupabaseClient;
  businessId: string;
  current: DomainRow;
  candidateDomain: string;
  userId: string;
}) {
  const { admin, businessId, current, candidateDomain, userId } = input;
  const existingReplacement = await readReplacement(admin, businessId);

  if (candidateDomain === current.domain) {
    return jsonError(
      "replacement_matches_current",
      "Это уже действующий домен сайта.",
      409,
    );
  }

  if (existingReplacement) {
    if (existingReplacement.candidate_domain === candidateDomain) {
      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    }

    return jsonError(
      "replacement_already_started",
      `Сначала завершите или отмените замену на ${existingReplacement.candidate_domain}.`,
      409,
    );
  }

  if (await domainReservedElsewhere(admin, businessId, candidateDomain)) {
    return jsonError(
      "domain_in_use",
      "Этот домен уже подключён или готовится для другого сайта OneStudio OS.",
      409,
    );
  }

  const { error: reserveError } = await admin
    .from("public_site_domain_replacements")
    .insert({
      business_id: businessId,
      current_domain: current.domain,
      current_redirect_domain: current.redirect_domain,
      candidate_domain: candidateDomain,
      phase: "preparing",
      status: "pending",
      ownership_verification_required: false,
      vercel_verified: false,
      dns_configured: false,
      ssl_ready: false,
      verification: [],
      dns_records: [],
      last_error: null,
      last_checked_at: null,
      created_by: userId,
    });

  if (reserveError) {
    if (reserveError.code === "23505") {
      return jsonError(
        "domain_in_use",
        "Этот домен уже подключён или готовится для другого сайта OneStudio OS.",
        409,
      );
    }

    console.error("Domain replacement reserve failed", reserveError);
    return jsonError(
      "domain_replacement_unavailable",
      "Не удалось начать замену домена.",
      503,
    );
  }

  try {
    const result = await connectVercelDomain(candidateDomain);
    await saveReplacementSyncResult(admin, businessId, result);
    const payload = await payloadForBusiness(admin, businessId);
    return NextResponse.json(payload);
  } catch (error) {
    const code = vercelDomainError(error);
    await admin
      .from("public_site_domain_replacements")
      .update({
        phase: "error",
        status: "error",
        last_error: code,
        last_checked_at: new Date().toISOString(),
      })
      .eq("business_id", businessId);

    console.error("Domain replacement connect failed", error);
    return jsonError(
      code,
      "Не удалось добавить новый домен. Старый домен продолжает работать.",
      502,
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId") || "";

  if (!isUuid(businessId)) {
    return jsonError("invalid_business", "Сайт не выбран.", 400);
  }

  const auth = await authorizeBusiness(businessId);
  if (auth.error === "signed_out") {
    return jsonError("signed_out", "Войдите в аккаунт.", 401);
  }
  if (auth.error) {
    return jsonError("forbidden", "У вас нет доступа к этому сайту.", 403);
  }

  try {
    const payload = await payloadForBusiness(adminClient(), businessId);
    if (!payload) {
      return jsonError("business_not_found", "Сайт не найден.", 404);
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Client domain GET failed", error);
    return jsonError(
      "client_domain_unavailable",
      "Не удалось загрузить настройки домена.",
      503,
    );
  }
}

export async function POST(request: Request) {
  let body: { businessId?: unknown; action?: unknown; domain?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("invalid_json", "Некорректный запрос.", 400);
  }

  const businessId =
    typeof body.businessId === "string" ? body.businessId.trim() : "";
  const action = typeof body.action === "string" ? body.action : "";
  const supportedActions = [
    "connect",
    "check",
    "start_replacement",
    "check_replacement",
    "complete_replacement",
    "cancel_replacement",
    "cleanup_replacement",
  ];

  if (!isUuid(businessId) || !supportedActions.includes(action)) {
    return jsonError("invalid_request", "Некорректный запрос.", 400);
  }

  const auth = await authorizeBusiness(businessId);
  if (auth.error === "signed_out") {
    return jsonError("signed_out", "Войдите в аккаунт.", 401);
  }
  if (auth.error) {
    return jsonError("forbidden", "У вас нет доступа к этому сайту.", 403);
  }

  let admin: SupabaseClient;
  try {
    admin = adminClient();
  } catch {
    return jsonError(
      "client_domain_unavailable",
      "Сервер доменов ещё не настроен.",
      503,
    );
  }

  const business = await readBusiness(admin, businessId);
  if (!business) {
    return jsonError("business_not_found", "Сайт не найден.", 404);
  }
  if (!business.isPublished) {
    return jsonError(
      "site_not_published",
      "Сначала опубликуйте сайт, затем подключайте домен.",
      409,
    );
  }

  if (action === "connect" || action === "start_replacement") {
    let domain: string;
    try {
      domain = normalizeCustomDomain(
        typeof body.domain === "string" ? body.domain : "",
      );
    } catch {
      return jsonError(
        "invalid_domain",
        "Введите домен без пути, например mystudio.pl или www.mystudio.pl.",
        400,
      );
    }

    const existing = await readDomain(admin, businessId);

    if (existing && existing.domain !== domain) {
      return startReplacement({
        admin,
        businessId,
        current: existing,
        candidateDomain: domain,
        userId: auth.user!.id,
      });
    }

    if (action === "start_replacement") {
      if (!existing) {
        return jsonError(
          "current_domain_not_found",
          "Сначала подключите основной домен.",
          404,
        );
      }

      return startReplacement({
        admin,
        businessId,
        current: existing,
        candidateDomain: domain,
        userId: auth.user!.id,
      });
    }

    if (await domainReservedElsewhere(admin, businessId, domain)) {
      return jsonError(
        "domain_in_use",
        "Этот домен уже подключён или готовится для другого сайта OneStudio OS.",
        409,
      );
    }

    const { error: reserveError } = await admin
      .from("public_site_domains")
      .upsert(
        {
          business_id: businessId,
          domain,
          status: "pending",
          ownership_verification_required: false,
          vercel_verified: false,
          dns_configured: false,
          ssl_ready: false,
          verification: [],
          dns_records: [],
          last_error: null,
          last_checked_at: null,
          created_by: auth.user!.id,
        },
        { onConflict: "business_id" },
      );

    if (reserveError) {
      if (reserveError.code === "23505") {
        return jsonError(
          "domain_in_use",
          "Этот домен уже подключён к другому сайту OneStudio OS.",
          409,
        );
      }
      console.error("Client domain reserve failed", reserveError);
      return jsonError(
        "client_domain_unavailable",
        "Не удалось сохранить домен.",
        503,
      );
    }

    try {
      const result = await connectVercelDomain(domain);
      await saveSyncResult(admin, businessId, result);
      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    } catch (error) {
      const code = vercelDomainError(error);
      await admin
        .from("public_site_domains")
        .update({
          status: "error",
          last_error: code,
          last_checked_at: new Date().toISOString(),
        })
        .eq("business_id", businessId);

      console.error("Client domain connect failed", error);
      return jsonError(
        code,
        "Vercel не смог добавить домен. Проверьте права токена и повторите попытку.",
        502,
      );
    }
  }

  if (action === "check") {
    const existing = await readDomain(admin, businessId);
    if (!existing) {
      return jsonError("domain_not_found", "Сначала добавьте домен.", 404);
    }

    if (
      existing.last_checked_at &&
      Date.now() - Date.parse(existing.last_checked_at) < 5_000
    ) {
      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    }

    try {
      const result = await inspectVercelDomain(
        existing.domain,
        existing.ownership_verification_required,
      );
      await saveSyncResult(admin, businessId, result);
      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    } catch (error) {
      const code = vercelDomainError(error);
      await admin
        .from("public_site_domains")
        .update({
          status: "error",
          last_error: code,
          last_checked_at: new Date().toISOString(),
        })
        .eq("business_id", businessId);

      console.error("Client domain check failed", error);
      return jsonError(
        code,
        "Не удалось проверить DNS. Подождите немного и повторите.",
        502,
      );
    }
  }

  const replacement = await readReplacement(admin, businessId);
  if (!replacement) {
    return jsonError(
      "domain_replacement_not_found",
      "Активная замена домена не найдена.",
      404,
    );
  }

  if (action === "check_replacement") {
    if (replacement.phase === "cleanup_pending") {
      return jsonError(
        "replacement_cleanup_required",
        "Новый домен уже включён. Завершите отключение старого домена.",
        409,
      );
    }

    if (
      replacement.last_checked_at &&
      Date.now() - Date.parse(replacement.last_checked_at) < 5_000
    ) {
      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    }

    try {
      const result = await inspectVercelDomain(
        replacement.candidate_domain,
        replacement.ownership_verification_required,
      );
      await saveReplacementSyncResult(admin, businessId, result);
      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    } catch (error) {
      const code = vercelDomainError(error);
      await admin
        .from("public_site_domain_replacements")
        .update({
          phase: "error",
          status: "error",
          last_error: code,
          last_checked_at: new Date().toISOString(),
        })
        .eq("business_id", businessId);

      console.error("Replacement domain check failed", error);
      return jsonError(
        code,
        "Не удалось проверить новый домен. Старый домен продолжает работать.",
        502,
      );
    }
  }

  if (action === "cancel_replacement") {
    if (replacement.phase === "cleanup_pending") {
      return jsonError(
        "replacement_already_promoted",
        "Новый домен уже включён. Можно только завершить отключение старого домена.",
        409,
      );
    }

    try {
      await removeVercelDomain(
        replacement.candidate_domain,
        replacement.candidate_redirect_domain,
      );

      const { error } = await admin
        .from("public_site_domain_replacements")
        .delete()
        .eq("business_id", businessId);
      if (error) throw error;

      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    } catch (error) {
      console.error("Domain replacement cancellation failed", error);
      return jsonError(
        vercelDomainError(error),
        "Не удалось отменить замену. Действующий домен не затронут.",
        502,
      );
    }
  }

  if (action === "complete_replacement") {
    if (
      replacement.phase !== "ready" ||
      replacement.status !== "active" ||
      !replacement.vercel_verified ||
      !replacement.dns_configured ||
      !replacement.ssl_ready
    ) {
      return jsonError(
        "replacement_domain_not_ready",
        "Новый домен ещё не готов. Сначала завершите DNS и HTTPS-проверку.",
        409,
      );
    }

    const { data, error } = await admin.rpc(
      "promote_public_site_domain_replacement",
      { p_business_id: businessId },
    );

    if (error) {
      console.error("Domain replacement promotion failed", error);
      return jsonError(
        error.code === "23505"
          ? "domain_in_use"
          : "domain_replacement_promotion_failed",
        error.code === "23505"
          ? "Новый домен уже используется другим сайтом."
          : "Не удалось включить новый домен. Старый домен продолжает работать.",
        error.code === "23505" ? 409 : 503,
      );
    }

    const promotion = (data || {}) as PromotionResult;
    const oldDomain = promotion.oldDomain || replacement.current_domain;
    const oldRedirectDomain =
      promotion.oldRedirectDomain ?? replacement.current_redirect_domain;

    try {
      await removeVercelDomain(oldDomain, oldRedirectDomain);
      const { error: cleanupError } = await admin
        .from("public_site_domain_replacements")
        .delete()
        .eq("business_id", businessId);
      if (cleanupError) throw cleanupError;

      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    } catch (cleanupError) {
      const code = vercelDomainError(cleanupError);
      await admin
        .from("public_site_domain_replacements")
        .update({
          phase: "cleanup_pending",
          last_error: code,
        })
        .eq("business_id", businessId);

      console.error("Old domain cleanup after promotion failed", cleanupError);
      const payload = await payloadForBusiness(
        admin,
        businessId,
        "Новый домен уже работает. OneStudio ещё завершает отключение старого домена.",
      );
      return NextResponse.json(payload);
    }
  }

  if (action === "cleanup_replacement") {
    if (replacement.phase !== "cleanup_pending") {
      return jsonError(
        "replacement_cleanup_not_required",
        "Очистка старого домена не требуется.",
        409,
      );
    }

    try {
      await removeVercelDomain(
        replacement.current_domain,
        replacement.current_redirect_domain,
      );
      const { error } = await admin
        .from("public_site_domain_replacements")
        .delete()
        .eq("business_id", businessId);
      if (error) throw error;

      const payload = await payloadForBusiness(admin, businessId);
      return NextResponse.json(payload);
    } catch (error) {
      const code = vercelDomainError(error);
      await admin
        .from("public_site_domain_replacements")
        .update({ last_error: code })
        .eq("business_id", businessId);

      console.error("Replacement cleanup retry failed", error);
      return jsonError(
        code,
        "Новый домен работает, но старый домен пока не удалось отключить.",
        502,
      );
    }
  }

  return jsonError("invalid_request", "Некорректный запрос.", 400);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId") || "";

  if (!isUuid(businessId)) {
    return jsonError("invalid_business", "Сайт не выбран.", 400);
  }

  const auth = await authorizeBusiness(businessId);
  if (auth.error === "signed_out") {
    return jsonError("signed_out", "Войдите в аккаунт.", 401);
  }
  if (auth.error) {
    return jsonError("forbidden", "У вас нет доступа к этому сайту.", 403);
  }

  let admin: SupabaseClient;
  try {
    admin = adminClient();
  } catch {
    return jsonError(
      "client_domain_unavailable",
      "Сервер доменов ещё не настроен.",
      503,
    );
  }

  const [existing, replacement] = await Promise.all([
    readDomain(admin, businessId),
    readReplacement(admin, businessId),
  ]);

  if (!existing && !replacement) {
    return NextResponse.json({ ok: true, removed: false });
  }

  try {
    await removeUniqueDomains([
      ...(existing
        ? [{ domain: existing.domain, redirectDomain: existing.redirect_domain }]
        : []),
      ...(replacement
        ? [
            {
              domain: replacement.candidate_domain,
              redirectDomain: replacement.candidate_redirect_domain,
            },
            {
              domain: replacement.current_domain,
              redirectDomain: replacement.current_redirect_domain,
            },
          ]
        : []),
    ]);

    const { error: replacementDeleteError } = await admin
      .from("public_site_domain_replacements")
      .delete()
      .eq("business_id", businessId);
    if (replacementDeleteError) throw replacementDeleteError;

    const { error: domainDeleteError } = await admin
      .from("public_site_domains")
      .delete()
      .eq("business_id", businessId);
    if (domainDeleteError) throw domainDeleteError;

    return NextResponse.json({ ok: true, removed: true });
  } catch (error) {
    console.error("Client domain removal failed", error);
    return jsonError(
      vercelDomainError(error),
      "Не удалось отключить домен.",
      502,
    );
  }
}

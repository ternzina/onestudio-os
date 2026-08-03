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
export const maxDuration = 30;

type DomainRow = ClientDomainRecord;

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type SiteSettingsRow = {
  is_published: boolean;
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

async function payloadForBusiness(
  admin: SupabaseClient,
  businessId: string,
): Promise<ClientDomainPayload | null> {
  const business = await readBusiness(admin, businessId);
  if (!business) return null;

  return {
    ok: true,
    business,
    domain: await readDomain(admin, businessId),
  };
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

  if (!isUuid(businessId) || !["connect", "check"].includes(action)) {
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

  if (action === "connect") {
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
      return jsonError(
        "domain_already_connected",
        `К этому сайту уже добавлен домен ${existing.domain}. Сначала отключите его.`,
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
      const saved = await saveSyncResult(admin, businessId, result);
      return NextResponse.json({ ok: true, business, domain: saved });
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

  const existing = await readDomain(admin, businessId);
  if (!existing) {
    return jsonError("domain_not_found", "Сначала добавьте домен.", 404);
  }

  if (
    existing.last_checked_at &&
    Date.now() - Date.parse(existing.last_checked_at) < 5_000
  ) {
    return NextResponse.json({ ok: true, business, domain: existing });
  }

  try {
    const result = await inspectVercelDomain(
      existing.domain,
      existing.ownership_verification_required,
    );
    const saved = await saveSyncResult(admin, businessId, result);
    return NextResponse.json({ ok: true, business, domain: saved });
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

  const existing = await readDomain(admin, businessId);
  if (!existing) {
    return NextResponse.json({ ok: true, removed: false });
  }

  try {
    await removeVercelDomain(existing.domain, existing.redirect_domain);
    const { error } = await admin
      .from("public_site_domains")
      .delete()
      .eq("business_id", businessId);
    if (error) throw error;

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

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  connectVercelDomain,
  removeVercelDomain,
  vercelDomainError,
} from "@/lib/server/vercel-domains";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FOUNDATION_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";

type WorkspaceManagementRow = {
  business_id: string;
  name: string;
  role: string;
  booking_count: number;
  client_count: number;
  payment_count: number;
  request_count: number;
  document_count: number;
  notification_count: number;
  google_calendar_connected: boolean;
  can_delete: boolean;
};

type DomainRow = {
  domain: string;
  redirect_domain: string | null;
};

type LifecycleStatus =
  | "pending"
  | "vercel_detached"
  | "completed"
  | "failed"
  | "rolled_back";

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

  if (!url || !key) throw new Error("workspace_delete_database_unavailable");

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function readDomain(admin: SupabaseClient, businessId: string) {
  const { data, error } = await admin
    .from("public_site_domains")
    .select("domain,redirect_domain")
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) throw error;
  return (data as DomainRow | null) || null;
}

async function createLifecycleEvent(
  admin: SupabaseClient,
  input: {
    businessId: string;
    workspaceName: string;
    domain: DomainRow | null;
    requestedBy: string;
  },
) {
  const { data, error } = await admin
    .from("domain_lifecycle_events")
    .insert({
      business_id: input.businessId,
      workspace_name: input.workspaceName,
      domain: input.domain?.domain ?? null,
      redirect_domain: input.domain?.redirect_domain ?? null,
      action: "workspace_delete",
      status: "pending",
      requested_by: input.requestedBy,
      attempts: 1,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw error || new Error("domain_lifecycle_event_not_created");
  }

  return data.id as string;
}

async function updateLifecycleEvent(
  admin: SupabaseClient,
  eventId: string,
  status: LifecycleStatus,
  values: Record<string, unknown> = {},
) {
  const { error } = await admin
    .from("domain_lifecycle_events")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...values,
    })
    .eq("id", eventId);

  if (error) {
    console.error("Domain lifecycle event update failed", error);
  }
}

function workspaceDeleteError(workspace: WorkspaceManagementRow) {
  if (workspace.role !== "owner") {
    return {
      code: "workspace_owner_required",
      message: "Это действие доступно только владельцу сайта.",
      status: 403,
    };
  }

  if (workspace.business_id === FOUNDATION_WORKSPACE_ID) {
    return {
      code: "workspace_foundation_cannot_be_deleted",
      message: "Базовое рабочее пространство нельзя удалить навсегда.",
      status: 409,
    };
  }

  const hasOperationalData =
    workspace.booking_count > 0 ||
    workspace.client_count > 0 ||
    workspace.payment_count > 0 ||
    workspace.request_count > 0 ||
    workspace.document_count > 0 ||
    workspace.notification_count > 0 ||
    workspace.google_calendar_connected;

  if (hasOperationalData || !workspace.can_delete) {
    return {
      code: "workspace_has_operational_data",
      message:
        "В этом сайте уже есть рабочие данные. Его можно только архивировать.",
      status: 409,
    };
  }

  return null;
}

export async function POST(request: Request) {
  let body: { businessId?: unknown; confirmationName?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("invalid_json", "Некорректный запрос.", 400);
  }

  const businessId =
    typeof body.businessId === "string" ? body.businessId.trim() : "";
  const confirmationName =
    typeof body.confirmationName === "string"
      ? body.confirmationName.trim()
      : "";

  if (!isUuid(businessId) || !confirmationName) {
    return jsonError("invalid_request", "Сайт не выбран.", 400);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("signed_out", "Войдите в аккаунт.", 401);
  }

  const { data: workspaceData, error: workspaceError } = await supabase.rpc(
    "list_my_workspace_management",
  );

  if (workspaceError) {
    console.error("Workspace deletion preflight failed", workspaceError);
    return jsonError(
      "workspace_delete_preflight_failed",
      "Не удалось проверить сайт перед удалением.",
      503,
    );
  }

  const workspace = ((workspaceData ?? []) as WorkspaceManagementRow[]).find(
    (item) => item.business_id === businessId,
  );

  if (!workspace) {
    return jsonError(
      "workspace_owner_required",
      "У вас нет доступа к этому сайту.",
      403,
    );
  }

  if (confirmationName !== workspace.name) {
    return jsonError(
      "workspace_confirmation_mismatch",
      "Название введено неверно. Удаление отменено.",
      400,
    );
  }

  const preflightError = workspaceDeleteError(workspace);
  if (preflightError) {
    return jsonError(
      preflightError.code,
      preflightError.message,
      preflightError.status,
    );
  }

  let admin: SupabaseClient;
  try {
    admin = adminClient();
  } catch {
    return jsonError(
      "workspace_delete_database_unavailable",
      "Сервер удаления сайтов ещё не настроен.",
      503,
    );
  }

  let domain: DomainRow | null;
  try {
    domain = await readDomain(admin, businessId);
  } catch (error) {
    console.error("Workspace domain preflight failed", error);
    return jsonError(
      "workspace_domain_preflight_failed",
      "Не удалось проверить привязанный домен. Удаление остановлено.",
      503,
    );
  }

  let eventId: string;
  try {
    eventId = await createLifecycleEvent(admin, {
      businessId,
      workspaceName: workspace.name,
      domain,
      requestedBy: user.id,
    });
  } catch (error) {
    console.error("Domain lifecycle event creation failed", error);
    return jsonError(
      "domain_lifecycle_log_unavailable",
      "Не удалось создать журнал безопасного удаления. Сайт не удалён.",
      503,
    );
  }

  if (domain) {
    try {
      await removeVercelDomain(domain.domain, domain.redirect_domain);
      await updateLifecycleEvent(admin, eventId, "vercel_detached", {
        vercel_detached_at: new Date().toISOString(),
        last_error: null,
      });
    } catch (error) {
      const code = vercelDomainError(error);
      await updateLifecycleEvent(admin, eventId, "failed", {
        last_error: code,
      });
      console.error("Workspace domain removal failed", error);
      return jsonError(
        code,
        "Не удалось отключить домен. Сайт не удалён.",
        502,
      );
    }
  }

  const { data: replacementBusinessId, error: deleteError } = await supabase.rpc(
    "delete_my_empty_workspace",
    {
      p_business_id: businessId,
      p_confirmation_name: confirmationName,
    },
  );

  if (deleteError) {
    let rollbackError: string | null = null;

    if (domain) {
      try {
        await connectVercelDomain(domain.domain);
        await updateLifecycleEvent(admin, eventId, "rolled_back", {
          last_error: deleteError.message,
          rollback_completed_at: new Date().toISOString(),
        });
      } catch (error) {
        rollbackError = vercelDomainError(error);
        await updateLifecycleEvent(admin, eventId, "failed", {
          last_error: `${deleteError.message}; rollback:${rollbackError}`,
        });
      }
    } else {
      await updateLifecycleEvent(admin, eventId, "failed", {
        last_error: deleteError.message,
      });
    }

    console.error("Workspace database deletion failed", deleteError);
    return jsonError(
      "workspace_delete_failed",
      rollbackError
        ? "Сайт не удалён, а домен не удалось вернуть автоматически. Обратитесь к администратору."
        : "Сайт не удалён. Привязка домена сохранена или восстановлена.",
      409,
    );
  }

  await updateLifecycleEvent(admin, eventId, "completed", {
    workspace_deleted_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    last_error: null,
  });

  return NextResponse.json({
    ok: true,
    deleted: true,
    replacementBusinessId:
      typeof replacementBusinessId === "string" ? replacementBusinessId : null,
    removedDomain: domain?.domain ?? null,
    removedRedirectDomain: domain?.redirect_domain ?? null,
  });
}

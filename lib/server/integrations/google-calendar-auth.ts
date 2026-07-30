import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function currentGoogleCalendarAdmin(requestedBusinessId?: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false as const, status: 401, error: "authentication_required" };
  }

  let businessId = requestedBusinessId || "";
  if (!businessId) {
    const { data, error } = await supabase.rpc("current_business_id");
    if (error || !data) {
      return { ok: false as const, status: 404, error: "workspace_not_found" };
    }
    businessId = String(data);
  }

  const { data: canConfigure, error: accessError } = await supabase.rpc(
    "can_configure_business",
    { p_business_id: businessId },
  );
  if (accessError || canConfigure !== true) {
    return { ok: false as const, status: 403, error: "insufficient_access" };
  }
  return {
    ok: true as const,
    businessId,
    userId: user.id,
  };
}

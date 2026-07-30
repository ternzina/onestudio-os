import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const getSupabaseAnonKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const getAdminSupabase = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return {
      error: "Нет токена авторизации",
      supabase: null,
      userId: null,
      businessId: null,
    };
  }

  const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return {
      error: "Не удалось проверить пользователя",
      supabase: null,
      userId: null,
      businessId: null,
    };
  }

  const { data: businessId, error: workspaceError } = await supabase.rpc(
    "current_business_id",
  );

  if (workspaceError || !businessId) {
    return {
      error: "Рабочее пространство не найдено",
      supabase: null,
      userId: user.id,
      businessId: null,
    };
  }

  const { data: canConfigure, error: accessError } = await supabase.rpc(
    "can_configure_business",
    { p_business_id: businessId },
  );

  if (accessError || canConfigure !== true) {
    return {
      error: "Недостаточно прав",
      supabase: null,
      userId: user.id,
      businessId: null,
    };
  }

  return {
    error: null,
    supabase,
    userId: user.id,
    businessId: String(businessId),
  };
};

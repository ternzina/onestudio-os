import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.app.created";

type GoogleTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

type GoogleCalendarIntegration = {
  business_id: string;
  resource_id: string | null;
  calendar_id: string;
  calendar_name: string;
  calendar_mode: "legacy_primary" | "app_created";
  access_token_ciphertext: string;
  refresh_token_ciphertext: string;
  token_expires_at: string | null;
  granted_scope: string;
  status: "connected" | "error";
  last_import_at: string | null;
  last_export_at: string | null;
  last_error: string | null;
  updated_at: string;
};

type GoogleEvent = {
  id?: string;
  etag?: string;
  status?: string;
  summary?: string;
  updated?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: {
    private?: Record<string, string>;
  };
};

type GoogleCalendarResource = {
  id?: string;
  summary?: string;
  description?: string;
  timeZone?: string;
};

type BusinessCalendarIdentity = {
  name: string;
  timezone: string;
  locale: string;
};

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  customer_notes: string;
  services: { title?: string } | Array<{ title?: string }> | null;
  clients:
    | { name?: string; email?: string | null; phone?: string | null }
    | Array<{ name?: string; email?: string | null; phone?: string | null }>
    | null;
};

export type GoogleCalendarAdapterStatus = {
  configured: boolean;
  missing: string[];
  redirectUri: string;
};

export type GoogleCalendarConnectionStatus = {
  connected: boolean;
  configured: boolean;
  missing: string[];
  calendarId: string | null;
  calendarName: string | null;
  calendarMode: "legacy_primary" | "app_created" | null;
  needsWorkCalendar: boolean;
  resourceId: string | null;
  resourceName: string | null;
  lastImportAt: string | null;
  lastExportAt: string | null;
  lastError: string | null;
};

function envText(name: string) {
  return (process.env[name] || "").trim();
}

function siteUrl() {
  return (
    envText("NEXT_PUBLIC_SITE_URL") ||
    envText("STRIPE_SITE_URL") ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function serviceClient(): SupabaseClient {
  const url = envText("NEXT_PUBLIC_SUPABASE_URL") || envText("SUPABASE_URL");
  const key =
    envText("SUPABASE_SERVICE_ROLE_KEY") || envText("SUPABASE_SECRET_KEY");
  if (!url || !key) {
    throw new Error("google_calendar_supabase_not_configured");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function encryptionKey() {
  const secret = envText("GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY");
  if (secret.length < 32) {
    throw new Error("google_calendar_encryption_key_not_configured");
  }
  return createHash("sha256").update(secret).digest();
}

function encryptToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decryptToken(value: string) {
  const [version, ivValue, tagValue, ciphertextValue] = value.split(".");
  if (
    version !== "v1" ||
    !ivValue ||
    !tagValue ||
    !ciphertextValue
  ) {
    throw new Error("google_calendar_token_ciphertext_invalid");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function getGoogleCalendarAdapterStatus(): GoogleCalendarAdapterStatus {
  const missing: string[] = [];
  if (!envText("GOOGLE_CALENDAR_CLIENT_ID")) {
    missing.push("GOOGLE_CALENDAR_CLIENT_ID");
  }
  if (!envText("GOOGLE_CALENDAR_CLIENT_SECRET")) {
    missing.push("GOOGLE_CALENDAR_CLIENT_SECRET");
  }
  if (envText("GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY").length < 32) {
    missing.push("GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY");
  }
  if (
    !envText("SUPABASE_SERVICE_ROLE_KEY") &&
    !envText("SUPABASE_SECRET_KEY")
  ) {
    missing.push("SUPABASE_SECRET_KEY");
  }
  return {
    configured: missing.length === 0,
    missing,
    redirectUri: `${siteUrl()}/api/admin/integrations/google-calendar/callback`,
  };
}

export function googleCalendarAuthorizationUrl(state: string) {
  const status = getGoogleCalendarAdapterStatus();
  if (!status.configured) {
    throw new Error(`google_calendar_missing:${status.missing.join(",")}`);
  }
  const query = new URLSearchParams({
    client_id: envText("GOOGLE_CALENDAR_CLIENT_ID"),
    redirect_uri: status.redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`;
}

async function parseGoogleResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(
      `google_calendar_http_${response.status}:${raw.slice(0, 800)}`,
    );
  }
  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

export async function exchangeGoogleCalendarCode(code: string) {
  const status = getGoogleCalendarAdapterStatus();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: envText("GOOGLE_CALENDAR_CLIENT_ID"),
      client_secret: envText("GOOGLE_CALENDAR_CLIENT_SECRET"),
      redirect_uri: status.redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  return parseGoogleResponse<GoogleTokenResponse>(response);
}

async function refreshGoogleCalendarToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: envText("GOOGLE_CALENDAR_CLIENT_ID"),
      client_secret: envText("GOOGLE_CALENDAR_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  return parseGoogleResponse<GoogleTokenResponse>(response);
}

async function firstBookableResource(
  supabase: SupabaseClient,
  businessId: string,
) {
  const { data } = await supabase
    .from("resources")
    .select("id")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .eq("is_bookable", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ? String(data.id) : null;
}

async function businessCalendarIdentity(
  supabase: SupabaseClient,
  businessId: string,
): Promise<BusinessCalendarIdentity> {
  const { data, error } = await supabase
    .from("businesses")
    .select("name,timezone,default_locale")
    .eq("id", businessId)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) {
    throw new Error(
      `google_calendar_business_identity_failed:${
        error?.message || "business_not_found"
      }`,
    );
  }
  return {
    name: String(data.name),
    timezone: String(data.timezone || "UTC"),
    locale: String(data.default_locale || "en").toLowerCase(),
  };
}

function workCalendarName(identity: BusinessCalendarIdentity) {
  const suffix = identity.locale.startsWith("pl")
    ? "rezerwacje"
    : identity.locale.startsWith("uk")
      ? "бронювання"
      : identity.locale.startsWith("ru")
        ? "записи"
        : "bookings";
  return `${identity.name.trim()} — ${suffix}`.slice(0, 250);
}

async function createBusinessWorkCalendar(
  token: string,
  identity: BusinessCalendarIdentity,
) {
  const summary = workCalendarName(identity);
  const calendar = await googleCalendarFetch<GoogleCalendarResource>(
    token,
    "/calendars",
    {
      method: "POST",
      body: JSON.stringify({
        summary,
        description:
          "Separate work calendar created by OneStudio OS for bookings and availability.",
        timeZone: identity.timezone,
      }),
    },
  );
  if (!calendar.id) {
    throw new Error("google_calendar_work_calendar_id_missing");
  }
  return {
    id: calendar.id,
    name: calendar.summary?.trim() || summary,
  };
}

export async function connectGoogleCalendar(
  businessId: string,
  userId: string,
  token: GoogleTokenResponse,
) {
  if (!token.access_token || !token.refresh_token) {
    throw new Error("google_calendar_refresh_token_missing");
  }
  const supabase = serviceClient();
  const [resourceId, identity, previousIntegration] = await Promise.all([
    firstBookableResource(supabase, businessId),
    businessCalendarIdentity(supabase, businessId),
    integrationForBusiness(supabase, businessId),
  ]);
  const workCalendar = await createBusinessWorkCalendar(
    token.access_token,
    identity,
  );
  const expiresAt = token.expires_in
    ? new Date(Date.now() + token.expires_in * 1000).toISOString()
    : null;

  if (previousIntegration?.resource_id) {
    const { error: clearBusyError } = await supabase.rpc(
      "replace_google_calendar_busy_windows",
      {
        p_business_id: businessId,
        p_resource_id: previousIntegration.resource_id,
        p_windows: [],
      },
    );
    if (clearBusyError) {
      throw new Error(
        `google_calendar_previous_busy_clear_failed:${clearBusyError.message}`,
      );
    }
  }
  const { error: clearLinksError } = await supabase
    .from("google_calendar_booking_links")
    .delete()
    .eq("business_id", businessId);
  if (clearLinksError) {
    throw new Error(
      `google_calendar_previous_links_clear_failed:${clearLinksError.message}`,
    );
  }

  const { error } = await supabase
    .from("google_calendar_integrations")
    .upsert(
      {
        business_id: businessId,
        resource_id: resourceId,
        calendar_id: workCalendar.id,
        calendar_name: workCalendar.name,
        calendar_mode: "app_created",
        access_token_ciphertext: encryptToken(token.access_token),
        refresh_token_ciphertext: encryptToken(token.refresh_token),
        token_expires_at: expiresAt,
        granted_scope: token.scope || "",
        status: "connected",
        last_error: null,
        connected_by: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    );
  if (error) throw new Error(`google_calendar_connect_failed:${error.message}`);
}

async function integrationForBusiness(
  supabase: SupabaseClient,
  businessId: string,
) {
  const { data, error } = await supabase
    .from("google_calendar_integrations")
    .select(
      "business_id,resource_id,calendar_id,calendar_name,calendar_mode,access_token_ciphertext,refresh_token_ciphertext,token_expires_at,granted_scope,status,last_import_at,last_export_at,last_error,updated_at",
    )
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw new Error(`google_calendar_status_failed:${error.message}`);
  return (data as GoogleCalendarIntegration | null) ?? null;
}

async function accessToken(
  supabase: SupabaseClient,
  integration: GoogleCalendarIntegration,
) {
  const expiresAt = integration.token_expires_at
    ? new Date(integration.token_expires_at).getTime()
    : 0;
  if (expiresAt > Date.now() + 90_000) {
    return decryptToken(integration.access_token_ciphertext);
  }

  const refreshed = await refreshGoogleCalendarToken(
    decryptToken(integration.refresh_token_ciphertext),
  );
  if (!refreshed.access_token) {
    throw new Error("google_calendar_access_token_missing");
  }
  const nextExpiresAt = refreshed.expires_in
    ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
    : null;
  const { error } = await supabase
    .from("google_calendar_integrations")
    .update({
      access_token_ciphertext: encryptToken(refreshed.access_token),
      token_expires_at: nextExpiresAt,
      granted_scope: refreshed.scope || integration.granted_scope,
      status: "connected",
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", integration.business_id);
  if (error) throw new Error(`google_calendar_token_save_failed:${error.message}`);
  return refreshed.access_token;
}

async function googleCalendarFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  return parseGoogleResponse<T>(response);
}

function relationOne<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

async function importBusyWindows(
  supabase: SupabaseClient,
  integration: GoogleCalendarIntegration,
  token: string,
) {
  if (!integration.resource_id) {
    return { imported: 0, skipped: "resource_missing" };
  }
  const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date(
    Date.now() + 370 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const windows: Array<Record<string, string>> = [];
  let pageToken = "";

  for (let page = 0; page < 10; page += 1) {
    const query = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      showDeleted: "false",
      maxResults: "250",
    });
    if (pageToken) query.set("pageToken", pageToken);
    const result = await googleCalendarFetch<{
      items?: GoogleEvent[];
      nextPageToken?: string;
    }>(
      token,
      `/calendars/${encodeURIComponent(integration.calendar_id)}/events?${query.toString()}`,
    );

    for (const event of result.items ?? []) {
      if (
        !event.id ||
        event.status === "cancelled" ||
        event.extendedProperties?.private?.onestudioBusinessId ===
          integration.business_id
      ) {
        continue;
      }
      const startAt = event.start?.dateTime || "";
      const endAt = event.end?.dateTime || "";
      const startDate = event.start?.date || "";
      const endDate = event.end?.date || "";
      if ((!startAt || !endAt) && (!startDate || !endDate)) continue;
      windows.push({
        event_id: event.id,
        summary: event.summary || "Занято",
        start_at: startAt,
        end_at: endAt,
        start_date: startDate,
        end_date: endDate,
        updated_at: event.updated || "",
      });
    }
    pageToken = result.nextPageToken || "";
    if (!pageToken || windows.length >= 500) break;
  }

  const { data, error } = await supabase.rpc(
    "replace_google_calendar_busy_windows",
    {
      p_business_id: integration.business_id,
      p_resource_id: integration.resource_id,
      p_windows: windows.slice(0, 500),
    },
  );
  if (error) throw new Error(`google_calendar_import_failed:${error.message}`);
  return { imported: Number(data ?? 0) };
}

function googleEventBody(
  integration: GoogleCalendarIntegration,
  booking: BookingRow,
) {
  const service = relationOne(booking.services);
  const client = relationOne(booking.clients);
  const contact = [client?.email, client?.phone].filter(Boolean).join(" · ");
  return {
    summary: `${service?.title || "Бронирование"} · ${
      client?.name || booking.reference
    }`,
    description: [
      `OneStudio OS · ${booking.reference}`,
      contact,
      booking.customer_notes,
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: booking.starts_at,
      timeZone: booking.timezone,
    },
    end: {
      dateTime: booking.ends_at,
      timeZone: booking.timezone,
    },
    extendedProperties: {
      private: {
        onestudioBusinessId: integration.business_id,
        onestudioBookingId: booking.id,
      },
    },
  };
}

async function exportBookings(
  supabase: SupabaseClient,
  integration: GoogleCalendarIntegration,
  token: string,
  bookingId?: string,
) {
  let query = supabase
    .from("bookings")
    .select(
      "id,reference,status,starts_at,ends_at,timezone,customer_notes,services(title),clients(name,email,phone)",
    )
    .eq("business_id", integration.business_id)
    .order("starts_at", { ascending: true })
    .limit(500);
  query = bookingId
    ? query.eq("id", bookingId)
    : query.gte(
        "ends_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      );

  const { data, error } = await query;
  if (error) throw new Error(`google_calendar_booking_read_failed:${error.message}`);
  const bookings = (data ?? []) as unknown as BookingRow[];
  const bookingIds = bookings.map((booking) => booking.id);
  const { data: linkData, error: linkError } = bookingIds.length
    ? await supabase
        .from("google_calendar_booking_links")
        .select("booking_id,external_event_id")
        .eq("business_id", integration.business_id)
        .in("booking_id", bookingIds)
    : { data: [], error: null };
  if (linkError) {
    throw new Error(`google_calendar_link_read_failed:${linkError.message}`);
  }
  const links = new Map(
    (linkData ?? []).map((link) => [
      String(link.booking_id),
      String(link.external_event_id),
    ]),
  );
  let exported = 0;
  let removed = 0;

  for (const booking of bookings) {
    const existingEventId = links.get(booking.id);
    if (booking.status === "cancelled") {
      if (existingEventId) {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            integration.calendar_id,
          )}/events/${encodeURIComponent(existingEventId)}?sendUpdates=none`,
          {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );
        if (!response.ok && response.status !== 404 && response.status !== 410) {
          await parseGoogleResponse(response);
        }
        await supabase
          .from("google_calendar_booking_links")
          .delete()
          .eq("business_id", integration.business_id)
          .eq("booking_id", booking.id);
        removed += 1;
      }
      continue;
    }
    if (booking.status === "draft") continue;

    const path = existingEventId
      ? `/calendars/${encodeURIComponent(
          integration.calendar_id,
        )}/events/${encodeURIComponent(existingEventId)}?sendUpdates=none`
      : `/calendars/${encodeURIComponent(
          integration.calendar_id,
        )}/events?sendUpdates=none`;
    const event = await googleCalendarFetch<GoogleEvent>(token, path, {
      method: existingEventId ? "PUT" : "POST",
      body: JSON.stringify(googleEventBody(integration, booking)),
    });
    if (!event.id) throw new Error("google_calendar_event_id_missing");
    const { error: saveError } = await supabase
      .from("google_calendar_booking_links")
      .upsert(
        {
          business_id: integration.business_id,
          booking_id: booking.id,
          external_event_id: event.id,
          external_etag: event.etag || null,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "business_id,booking_id" },
      );
    if (saveError) {
      throw new Error(`google_calendar_link_save_failed:${saveError.message}`);
    }
    exported += 1;
  }

  return { exported, removed };
}

export async function googleCalendarConnectionStatus(
  businessId: string,
): Promise<GoogleCalendarConnectionStatus> {
  const adapter = getGoogleCalendarAdapterStatus();
  const supabase = serviceClient();
  const integration = await integrationForBusiness(supabase, businessId);
  let resourceName: string | null = null;
  if (integration?.resource_id) {
    const { data } = await supabase
      .from("resources")
      .select("name")
      .eq("business_id", businessId)
      .eq("id", integration.resource_id)
      .maybeSingle();
    resourceName = data?.name ? String(data.name) : null;
  }
  return {
    connected: integration?.status === "connected",
    configured: adapter.configured,
    missing: adapter.missing,
    calendarId: integration?.calendar_id ?? null,
    calendarName:
      integration?.calendar_name ||
      (integration?.calendar_id === "primary"
        ? "Primary Google Calendar"
        : integration?.calendar_id) ||
      null,
    calendarMode: integration?.calendar_mode ?? null,
    needsWorkCalendar: Boolean(
      integration &&
        (integration.calendar_mode !== "app_created" ||
          !integration.granted_scope.split(/\s+/).includes(GOOGLE_CALENDAR_SCOPE)),
    ),
    resourceId: integration?.resource_id ?? null,
    resourceName,
    lastImportAt: integration?.last_import_at ?? null,
    lastExportAt: integration?.last_export_at ?? null,
    lastError: integration?.last_error ?? null,
  };
}

export async function syncGoogleCalendarForBusiness(
  businessId: string,
  options: { bookingId?: string; force?: boolean } = {},
) {
  const adapter = getGoogleCalendarAdapterStatus();
  if (!adapter.configured) {
    return { skipped: "adapter_not_configured", imported: 0, exported: 0 };
  }
  const supabase = serviceClient();
  const integration = await integrationForBusiness(supabase, businessId);
  if (!integration || integration.status !== "connected") {
    return { skipped: "not_connected", imported: 0, exported: 0 };
  }

  try {
    const token = await accessToken(supabase, integration);
    const importIsFresh =
      integration.last_import_at &&
      Date.now() - new Date(integration.last_import_at).getTime() <
        5 * 60 * 1000;
    const exportIsFresh =
      integration.last_export_at &&
      Date.now() - new Date(integration.last_export_at).getTime() <
        5 * 60 * 1000;
    const importResult =
      options.force || !importIsFresh
        ? await importBusyWindows(supabase, integration, token)
        : { imported: 0, skipped: "fresh" };
    const exportResult =
      options.bookingId || options.force || !exportIsFresh
        ? await exportBookings(
            supabase,
            integration,
            token,
            options.bookingId,
          )
        : { exported: 0, removed: 0 };
    const now = new Date().toISOString();
    await supabase
      .from("google_calendar_integrations")
      .update({
        last_import_at:
          options.force || !importIsFresh
            ? now
            : integration.last_import_at,
        last_export_at:
          options.bookingId || options.force || !exportIsFresh
            ? now
            : integration.last_export_at,
        last_error: null,
        status: "connected",
        updated_at: now,
      })
      .eq("business_id", businessId);
    return { ...importResult, ...exportResult };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase
      .from("google_calendar_integrations")
      .update({
        last_error: message.slice(0, 2000),
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId);
    throw error;
  }
}

export async function businessIdForPublicSlug(businessSlug: string) {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", businessSlug.toLowerCase().trim())
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(`google_calendar_business_read_failed:${error.message}`);
  return data?.id ? String(data.id) : null;
}

export async function disconnectGoogleCalendar(businessId: string) {
  const supabase = serviceClient();
  const integration = await integrationForBusiness(supabase, businessId);
  if (integration) {
    try {
      const refreshToken = decryptToken(integration.refresh_token_ciphertext);
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: refreshToken }),
        cache: "no-store",
      });
    } catch (error) {
      console.warn("Google Calendar token revocation failed", error);
    }
  }
  if (integration?.resource_id) {
    await supabase.rpc("replace_google_calendar_busy_windows", {
      p_business_id: businessId,
      p_resource_id: integration.resource_id,
      p_windows: [],
    });
  }
  await supabase
    .from("google_calendar_booking_links")
    .delete()
    .eq("business_id", businessId);
  await supabase
    .from("google_calendar_busy_windows")
    .delete()
    .eq("business_id", businessId);
  const { error } = await supabase
    .from("google_calendar_integrations")
    .delete()
    .eq("business_id", businessId);
  if (error) throw new Error(`google_calendar_disconnect_failed:${error.message}`);
}

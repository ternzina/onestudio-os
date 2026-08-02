import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type NotificationDeliveryMode = "disabled" | "test" | "live";
export type NotificationRunSource = "admin" | "cron";

type ClaimedNotificationJob = {
  id: string;
  business_id: string;
  booking_id: string | null;
  event_type: string;
  channel: "email";
  locale: string;
  recipient_email: string;
  subject: string;
  body: string;
  payload: Record<string, unknown>;
  attempt_number: number;
  idempotency_key: string;
  from_name: string;
  reply_to_email: string | null;
};

type ResendSuccess = {
  id?: string;
};

type ResendErrorBody = {
  name?: string;
  message?: string;
  statusCode?: number;
};

export type ResendAdapterStatus = {
  provider: "resend";
  mode: NotificationDeliveryMode;
  configured: boolean;
  fromEmail: string | null;
  testRecipient: string | null;
  batchSize: number;
  cronConfigured: boolean;
  missing: string[];
};

export type ResendQueueResult = {
  provider: "resend";
  mode: NotificationDeliveryMode;
  source: NotificationRunSource;
  recovered: number;
  claimed: number;
  sent: number;
  failed: number;
  disabled: boolean;
  failures: Array<{ jobId: string; message: string }>;
};

class ResendAdapterConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResendAdapterConfigurationError";
  }
}

function envText(name: string) {
  return (process.env[name] || "").trim();
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clampInteger(value: string, fallback: number, minimum: number, maximum: number) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function deliveryMode(): NotificationDeliveryMode {
  const value = envText("NOTIFICATION_DELIVERY_MODE").toLowerCase();
  if (value === "test" || value === "live") return value;
  return "disabled";
}

function cleanHeaderText(value: string, fallback: string) {
  const cleaned = value
    .replace(/[\r\n<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return cleaned || fallback;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function messageHtml(subject: string, body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#332f29;">${escapeHtml(
          paragraph,
        ).replaceAll("\n", "<br>")}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f3f0e9;font-family:Arial,sans-serif;color:#17191f;">
    <div style="padding:28px 14px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e0d6;border-radius:24px;padding:30px;">
        <h1 style="margin:0 0 22px;font-size:28px;line-height:1.25;color:#17191f;">${escapeHtml(subject)}</h1>
        ${paragraphs || `<p style="margin:0;font-size:16px;line-height:1.7;color:#332f29;">${escapeHtml(body)}</p>`}
      </div>
    </div>
  </body>
</html>`;
}

function serviceClient(): SupabaseClient {
  const url = envText("NEXT_PUBLIC_SUPABASE_URL") || envText("SUPABASE_URL");
  const key = envText("SUPABASE_SERVICE_ROLE_KEY") || envText("SUPABASE_SECRET_KEY");

  if (!url) {
    throw new ResendAdapterConfigurationError("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }

  if (!key) {
    throw new ResendAdapterConfigurationError(
      "Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getResendAdapterStatus(): ResendAdapterStatus {
  const mode = deliveryMode();
  const fromEmail = envText("RESEND_FROM_EMAIL");
  const testRecipient = envText("NOTIFICATION_TEST_RECIPIENT");
  const missing: string[] = [];

  if (mode !== "disabled") {
    if (!envText("RESEND_API_KEY")) missing.push("RESEND_API_KEY");
    if (!validEmail(fromEmail)) missing.push("RESEND_FROM_EMAIL");
    if (
      !envText("NEXT_PUBLIC_SUPABASE_URL") &&
      !envText("SUPABASE_URL")
    ) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL");
    }
    if (
      !envText("SUPABASE_SECRET_KEY") &&
      !envText("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      missing.push("SUPABASE_SECRET_KEY");
    }
  }

  if (mode === "test" && !validEmail(testRecipient)) {
    missing.push("NOTIFICATION_TEST_RECIPIENT");
  }

  return {
    provider: "resend",
    mode,
    configured: mode !== "disabled" && missing.length === 0,
    fromEmail: validEmail(fromEmail) ? fromEmail : null,
    testRecipient: mode === "test" && validEmail(testRecipient) ? testRecipient : null,
    batchSize: clampInteger(envText("NOTIFICATION_BATCH_SIZE"), 25, 1, 100),
    cronConfigured: envText("CRON_SECRET").length >= 16,
    missing,
  };
}

function retryAt(attemptNumber: number) {
  const baseSeconds = clampInteger(
    envText("NOTIFICATION_RETRY_BASE_SECONDS"),
    60,
    15,
    3600,
  );
  const delaySeconds = Math.min(6 * 60 * 60, baseSeconds * 2 ** Math.max(0, attemptNumber - 1));
  return new Date(Date.now() + delaySeconds * 1000).toISOString();
}

function parseResendError(status: number, raw: string) {
  let parsed: ResendErrorBody | null = null;
  try {
    parsed = JSON.parse(raw) as ResendErrorBody;
  } catch {
    parsed = null;
  }

  const name = parsed?.name || "";
  const message = parsed?.message || raw || `Resend HTTP ${status}`;
  const retryable =
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500 ||
    (status === 409 && name === "concurrent_idempotent_requests");

  return {
    message: `${name ? `${name}: ` : ""}${message}`.slice(0, 4000),
    retryable,
  };
}

async function markFailed(
  supabase: SupabaseClient,
  job: ClaimedNotificationJob,
  message: string,
  retryable: boolean,
) {
  const { error } = await supabase.rpc("mark_notification_failed", {
    p_job_id: job.id,
    p_error: message,
    p_retry_at: retryable ? retryAt(job.attempt_number) : null,
  });

  if (error) {
    throw new Error(`Could not finalize failed notification ${job.id}: ${error.message}`);
  }
}

async function sendOne(
  supabase: SupabaseClient,
  job: ClaimedNotificationJob,
  status: ResendAdapterStatus,
) {
  const apiKey = envText("RESEND_API_KEY");
  const fromEmail = status.fromEmail;
  if (!apiKey || !fromEmail) {
    throw new ResendAdapterConfigurationError("Resend adapter is not configured.");
  }

  const testRecipient = status.testRecipient;
  const targetEmail = status.mode === "test" ? testRecipient : job.recipient_email;
  if (!targetEmail) {
    await markFailed(supabase, job, "notification_test_recipient_missing", false);
    return { sent: false, message: "notification_test_recipient_missing" };
  }

  const subject =
    status.mode === "test"
      ? `[TEST → ${job.recipient_email}] ${job.subject}`
      : job.subject;
  const fromName = cleanHeaderText(job.from_name, "OneStudio OS");
  const payload: Record<string, unknown> = {
    from: `${fromName} <${fromEmail}>`,
    to: [targetEmail],
    subject,
    text: job.body,
    html: messageHtml(job.subject, job.body),
    tags: [
      { name: "event", value: job.event_type.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 256) },
      { name: "job", value: job.id.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 256) },
    ],
  };

  if (job.reply_to_email && validEmail(job.reply_to_email)) {
    payload.reply_to = job.reply_to_email;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `onestudio/${job.id}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });

    const raw = await response.text();
    if (!response.ok) {
      const providerError = parseResendError(response.status, raw);
      await markFailed(supabase, job, providerError.message, providerError.retryable);
      return { sent: false, message: providerError.message };
    }

    let providerMessageId: string | null = null;
    try {
      providerMessageId = ((JSON.parse(raw) as ResendSuccess).id || "").trim() || null;
    } catch {
      providerMessageId = null;
    }

    const { error: sentError } = await supabase.rpc("mark_notification_sent", {
      p_job_id: job.id,
      p_provider_message_id: providerMessageId,
    });

    if (sentError) {
      await markFailed(
        supabase,
        job,
        `notification_state_update_failed: ${sentError.message}`,
        true,
      );
      return { sent: false, message: sentError.message };
    }

    return { sent: true, message: "" };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    await markFailed(supabase, job, `resend_transport_error: ${message}`, true);
    return { sent: false, message };
  }
}

export async function prepareBookingReminders(
  daysAhead = 30,
): Promise<number> {
  const boundedDays = Math.min(366, Math.max(1, Math.trunc(daysAhead)));
  const until = new Date(Date.now() + boundedDays * 86_400_000).toISOString();
  const supabase = serviceClient();

  const { data, error } = await supabase.rpc("schedule_all_booking_reminders", {
    p_until: until,
  });
  if (error) throw error;

  return Number(data ?? 0);
}

export async function processResendQueue(
  source: NotificationRunSource,
): Promise<ResendQueueResult> {
  const status = getResendAdapterStatus();

  if (status.mode === "disabled") {
    return {
      provider: "resend",
      mode: status.mode,
      source,
      recovered: 0,
      claimed: 0,
      sent: 0,
      failed: 0,
      disabled: true,
      failures: [],
    };
  }

  if (!status.configured) {
    throw new ResendAdapterConfigurationError(
      `Resend adapter is missing: ${status.missing.join(", ")}`,
    );
  }

  const supabase = serviceClient();
  const staleMinutes = clampInteger(
    envText("NOTIFICATION_STALE_PROCESSING_MINUTES"),
    15,
    5,
    1440,
  );
  const staleBefore = new Date(Date.now() - staleMinutes * 60_000).toISOString();

  const { data: recoveredData, error: recoveredError } = await supabase.rpc(
    "recover_stale_notification_jobs",
    {
      p_provider: "resend",
      p_stale_before: staleBefore,
    },
  );
  if (recoveredError) throw recoveredError;

  const { data, error } = await supabase.rpc("claim_notification_jobs", {
    p_provider: "resend",
    p_limit: status.batchSize,
  });
  if (error) throw error;

  const jobs = (data ?? []) as ClaimedNotificationJob[];
  const failures: Array<{ jobId: string; message: string }> = [];
  let sent = 0;

  for (const job of jobs) {
    const result = await sendOne(supabase, job, status);
    if (result.sent) {
      sent += 1;
    } else {
      failures.push({ jobId: job.id, message: result.message });
    }
  }

  return {
    provider: "resend",
    mode: status.mode,
    source,
    recovered: Number(recoveredData ?? 0),
    claimed: jobs.length,
    sent,
    failed: failures.length,
    disabled: false,
    failures,
  };
}

export async function processResendJob(
  source: NotificationRunSource,
  jobId: string,
): Promise<ResendQueueResult> {
  const status = getResendAdapterStatus();

  if (status.mode === "disabled") {
    return {
      provider: "resend",
      mode: status.mode,
      source,
      recovered: 0,
      claimed: 0,
      sent: 0,
      failed: 0,
      disabled: true,
      failures: [],
    };
  }

  if (!status.configured) {
    throw new ResendAdapterConfigurationError(
      `Resend adapter is missing: ${status.missing.join(", ")}`,
    );
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
    throw new Error("invalid_notification_job_id");
  }

  const supabase = serviceClient();
  const { data, error } = await supabase.rpc("claim_notification_job", {
    p_job_id: jobId,
    p_provider: "resend",
  });
  if (error) throw error;

  const jobs = (data ?? []) as ClaimedNotificationJob[];
  if (jobs.length !== 1) {
    throw new Error("notification_job_not_sendable");
  }

  const job = jobs[0];
  const result = await sendOne(supabase, job, status);
  return {
    provider: "resend",
    mode: status.mode,
    source,
    recovered: 0,
    claimed: 1,
    sent: result.sent ? 1 : 0,
    failed: result.sent ? 0 : 1,
    disabled: false,
    failures: result.sent ? [] : [{ jobId: job.id, message: result.message }],
  };
}

export function isResendConfigurationError(error: unknown) {
  return error instanceof ResendAdapterConfigurationError;
}

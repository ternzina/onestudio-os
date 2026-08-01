import {
  isResendConfigurationError,
  processResendQueue,
} from "@/lib/server/notifications/resend-adapter";

export type ImmediateNotificationDispatchResult = {
  ok: boolean;
  error: string | null;
};

/**
 * Tries to deliver due notification jobs immediately after a public action.
 * Delivery failures never roll back the booking mutation: the queue remains
 * available for the scheduled cron or a manual retry from the admin panel.
 */
export async function dispatchQueuedNotificationsBestEffort(
  source: string,
): Promise<ImmediateNotificationDispatchResult> {
  try {
    await processResendQueue(
      source as Parameters<typeof processResendQueue>[0],
    );
    return { ok: true, error: null };
  } catch (error) {
    const code = isResendConfigurationError(error)
      ? "notification_adapter_not_configured"
      : "notification_dispatch_failed";

    console.error("Immediate notification dispatch failed", {
      source,
      code,
      message: error instanceof Error ? error.message : String(error),
    });

    return { ok: false, error: code };
  }
}

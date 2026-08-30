"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, RefreshCw, Webhook } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const frame =
  "flex flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setEdges({
      start: scrollLeft > 1,
      end: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    const observer = new view.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  return { ref, edges, onScroll: update };
}

type Outcome = "delivered" | "failed";

type Delivery = {
  id: string;
  event: string;
  host: string;
  attempt: number;
  status: string;
  code: number | null;
  duration: string;
  outcome: Outcome;
  request: string;
  response: string;
};

const DELIVERIES: Delivery[] = [
  {
    id: "msg_2Rk9",
    event: "invoice.finalized",
    host: "hooks.northwind.io",
    attempt: 1,
    status: "200 OK",
    code: 200,
    duration: "142 ms",
    outcome: "delivered",
    request: `POST /v2/events HTTP/1.1
Host: hooks.northwind.io
Content-Type: application/json
Webhook-Id: msg_2Rk9
Webhook-Signature: v1,4f2a8c…9de1`,
    response: `{
  "received": true,
  "event_id": "evt_1P8kQz",
  "queued_at": "2026-08-07T20:14:11Z"
}`,
  },
  {
    id: "msg_2Rk8",
    event: "customer.subscription.updated",
    host: "api.brightledger.com",
    attempt: 1,
    status: "202 Accepted",
    code: 202,
    duration: "318 ms",
    outcome: "delivered",
    request: `POST /webhooks/billing HTTP/1.1
Host: api.brightledger.com
Content-Type: application/json
Webhook-Id: msg_2Rk8
Webhook-Signature: v1,7b1e0a…c42f`,
    response: `{
  "received": true,
  "handler": "billing.sync",
  "duration_ms": 311
}`,
  },
  {
    id: "msg_2Rk7",
    event: "payout.paid",
    host: "hooks.meridian.app",
    attempt: 3,
    status: "500 Server Error",
    code: 500,
    duration: "1.24 s",
    outcome: "failed",
    request: `POST /hooks/payouts HTTP/1.1
Host: hooks.meridian.app
Content-Type: application/json
Webhook-Id: msg_2Rk7
Webhook-Signature: v1,d90c31…1aa7`,
    response: `{
  "error": {
    "type": "endpoint_error",
    "message": "Internal server error",
    "status": 500
  }
}`,
  },
  {
    id: "msg_2Rk6",
    event: "charge.refunded",
    host: "hooks.northwind.io",
    attempt: 1,
    status: "200 OK",
    code: 200,
    duration: "96 ms",
    outcome: "delivered",
    request: `POST /v2/events HTTP/1.1
Host: hooks.northwind.io
Content-Type: application/json
Webhook-Id: msg_2Rk6
Webhook-Signature: v1,52ff7c…8b03`,
    response: `{
  "received": true,
  "event_id": "evt_1P8jTa"
}`,
  },
  {
    id: "msg_2Rk5",
    event: "customer.created",
    host: "ingest.parcelworks.dev",
    attempt: 1,
    status: "201 Created",
    code: 201,
    duration: "204 ms",
    outcome: "delivered",
    request: `POST /ingest HTTP/1.1
Host: ingest.parcelworks.dev
Content-Type: application/json
Webhook-Id: msg_2Rk5
Webhook-Signature: v1,ab3419…67cd`,
    response: `{
  "received": true,
  "record_id": "cus_9Qh2Lm",
  "created": true
}`,
  },
  {
    id: "msg_2Rk4",
    event: "invoice.payment_failed",
    host: "api.brightledger.com",
    attempt: 2,
    status: "204 No Content",
    code: 204,
    duration: "173 ms",
    outcome: "delivered",
    request: `POST /webhooks/billing HTTP/1.1
Host: api.brightledger.com
Content-Type: application/json
Webhook-Id: msg_2Rk4
Webhook-Signature: v1,10ce88…44b2`,
    response: `{
  "received": true,
  "handler": "billing.dunning"
}`,
  },
  {
    id: "msg_2Rk3",
    event: "checkout.session.completed",
    host: "hooks.meridian.app",
    attempt: 5,
    status: "Timed out",
    code: null,
    duration: "30.00 s",
    outcome: "failed",
    request: `POST /hooks/checkout HTTP/1.1
Host: hooks.meridian.app
Content-Type: application/json
Webhook-Id: msg_2Rk3
Webhook-Signature: v1,c7e204…39f0`,
    response: `{
  "error": {
    "type": "timeout",
    "message": "No response after 30000 ms",
    "attempts": 5
  }
}`,
  },
  {
    id: "msg_2Rk2",
    event: "account.updated",
    host: "ingest.parcelworks.dev",
    attempt: 1,
    status: "200 OK",
    code: 200,
    duration: "128 ms",
    outcome: "delivered",
    request: `POST /ingest HTTP/1.1
Host: ingest.parcelworks.dev
Content-Type: application/json
Webhook-Id: msg_2Rk2
Webhook-Signature: v1,90ab12…7e5c`,
    response: `{
  "received": true,
  "record_id": "acct_4Tz8Wp"
}`,
  },
];

const FILTERS: { id: "all" | Outcome; label: string }[] = [
  { id: "all", label: "All" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
];

const ENDPOINTS = DELIVERIES.reduce<string[]>((acc, d) => {
  if (!acc.includes(d.host)) acc.push(d.host);
  return acc;
}, []);

function CodeSurface({ label, body }: { label: string; body: string }) {
  const { ref, edges, onScroll } = useScrollFade<HTMLPreElement>();

  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <div className="relative overflow-hidden rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <pre
          ref={ref}
          onScroll={onScroll}
          style={{ touchAction: "pan-x" }}
          className="overflow-x-auto whitespace-pre px-3 py-2.5 font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300"
        >
          {body}
        </pre>
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
            edges.start ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
            edges.end ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
}

export default function List6() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | Outcome>("all");
  const [endpoint, setEndpoint] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const rows = DELIVERIES.filter(
    (d) =>
      (filter === "all" || d.outcome === filter) &&
      (endpoint === "all" || d.host === endpoint),
  );

  const applyFilters = (nextFilter: "all" | Outcome, nextEndpoint: string) => {
    setFilter(nextFilter);
    setEndpoint(nextEndpoint);
    if (openId) {
      const open = DELIVERIES.find((d) => d.id === openId);
      const stillVisible =
        open &&
        (nextFilter === "all" || open.outcome === nextFilter) &&
        (nextEndpoint === "all" || open.host === nextEndpoint);
      if (!stillVisible) setOpenId(null);
    }
  };

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[720px]">
        <header className="mb-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
              Webhook deliveries
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-neutral-500">
              Outbound attempts to your customer endpoints
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <select
                value={endpoint}
                onChange={(e) => applyFilters(filter, e.target.value)}
                aria-label="Filter by destination endpoint"
                className={cx(
                  "h-8 cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-[13px] text-neutral-900 hover:border-neutral-300 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white",
                  transition,
                  focus,
                )}
              >
                <option value="all">All endpoints</option>
                {ENDPOINTS.map((host) => (
                  <option key={host} value={host}>
                    {host}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              />
            </div>

            <div
              role="tablist"
              aria-label="Filter by delivery outcome"
              className="flex items-center gap-1 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900"
            >
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => applyFilters(f.id, endpoint)}
                    className={cx(
                      "h-7 cursor-pointer rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px] font-medium",
                      transition,
                      focus,
                      active
                        ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-neutral-950 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {rows.length === 0 ? (
          <div className={cx(frame, "items-center px-6 py-16 text-center")}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
              <Webhook className="h-5 w-5 text-neutral-500" />
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              No deliveries to show
            </p>
            <p className="mt-1 max-w-xs text-xs text-neutral-600 dark:text-neutral-400">
              No attempts match this outcome and endpoint. Reset the filters to
              see every delivery.
            </p>
            <button
              type="button"
              onClick={() => applyFilters("all", "all")}
              className={cx(
                "mt-4 inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800",
                transition,
                focus,
              )}
            >
              Show all deliveries
            </button>
          </div>
        ) : (
          <ul className={frame}>
            {rows.map((d, i) => {
              const open = openId === d.id;
              const failed = d.outcome === "failed";
              return (
                <li
                  key={d.id}
                  className={cx(panel, "overflow-hidden")}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? undefined : "translateY(4px)",
                    transition:
                      "opacity 200ms ease-out, transform 200ms ease-out",
                    transitionDelay: `${Math.min(i, 8) * 20}ms`,
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`delivery-${d.id}`}
                    onClick={() => setOpenId(open ? null : d.id)}
                    className={cx(
                      "flex h-[56px] w-full cursor-pointer items-center gap-3 px-3 text-left",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                      transition,
                      focus,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        failed
                          ? "bg-red-500"
                          : "bg-neutral-300 dark:bg-neutral-600",
                      )}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[13px] text-neutral-900 dark:text-neutral-100">
                        {d.event}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-neutral-500">
                        {d.host} · attempt {d.attempt}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span
                        className={cx(
                          "block text-[13px] tabular-nums",
                          failed
                            ? "text-red-600 dark:text-red-500"
                            : "text-neutral-900 dark:text-neutral-100",
                        )}
                      >
                        {d.status}
                      </span>
                      <span className="mt-0.5 block text-[12px] tabular-nums text-neutral-500">
                        {d.duration}
                      </span>
                    </span>

                    <ChevronDown
                      aria-hidden="true"
                      className={cx(
                        "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ease-out motion-reduce:transition-none",
                        open && "rotate-180",
                      )}
                    />
                  </button>

                  <div
                    id={`delivery-${d.id}`}
                    className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-3 px-3 pb-3 pt-1">
                        <CodeSurface label="Request" body={d.request} />
                        <CodeSurface label="Response" body={d.response} />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className={cx(
                              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-100 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800",
                              transition,
                              focus,
                            )}
                          >
                            <RefreshCw
                              aria-hidden="true"
                              className="h-3.5 w-3.5 text-neutral-500"
                            />
                            Replay delivery
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ClientDomainErrorPayload,
  ClientDomainPayload,
  DomainDnsRecord,
  DomainStatus,
  DomainVerification,
} from "@/lib/domains/types";

const STATUS: Record<
  DomainStatus,
  { label: string; description: string; className: string }
> = {
  pending: {
    label: "Добавляем",
    description: "OneStudio регистрирует домен в проекте Vercel.",
    className: "bg-white/[0.07] text-white/65",
  },
  verification_required: {
    label: "Нужно подтверждение",
    description: "Добавьте TXT-запись владения и запустите проверку ещё раз.",
    className: "bg-amber-300/12 text-amber-100",
  },
  dns_pending: {
    label: "Ожидаем DNS",
    description: "Записи уже известны. DNS у регистратора может обновиться не сразу.",
    className: "bg-sky-300/10 text-sky-100",
  },
  active: {
    label: "Подключён",
    description: "Домен подтверждён, направлен на OneStudio и защищён HTTPS.",
    className: "bg-emerald-300/12 text-emerald-100",
  },
  error: {
    label: "Нужна проверка",
    description: "Последняя проверка завершилась ошибкой. Данные сайта не затронуты.",
    className: "bg-red-300/12 text-red-100",
  },
};

type ReplacementPhase = "preparing" | "ready" | "cleanup_pending" | "error";

type DomainReplacementRecord = {
  id: string;
  business_id: string;
  current_domain: string;
  current_redirect_domain: string | null;
  candidate_domain: string;
  candidate_redirect_domain: string | null;
  phase: ReplacementPhase;
  status: DomainStatus;
  ownership_verification_required: boolean;
  vercel_verified: boolean;
  dns_configured: boolean;
  ssl_ready: boolean;
  verification: DomainVerification[];
  dns_records: DomainDnsRecord[];
  last_error: string | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

type DomainManagementPayload = ClientDomainPayload & {
  replacement: DomainReplacementRecord | null;
  warning?: string;
};

type DomainAction =
  | "connect"
  | "check"
  | "start_replacement"
  | "check_replacement"
  | "complete_replacement"
  | "cancel_replacement"
  | "cleanup_replacement";

type BusyAction =
  | "connect"
  | "check"
  | "replace"
  | "checkReplacement"
  | "completeReplacement"
  | "cancelReplacement"
  | "cleanupReplacement"
  | "remove";

function responseMessage(payload: ClientDomainErrorPayload | null) {
  return payload?.message || "Не удалось выполнить действие.";
}

function recordPurpose(record: DomainDnsRecord) {
  if (record.purpose === "verification") return "Подтверждение владения";
  if (record.purpose === "redirect") return "Переадресация второго адреса";
  return "Основной адрес сайта";
}

function actionBusy(action: DomainAction): BusyAction {
  if (action === "start_replacement") return "replace";
  if (action === "check_replacement") return "checkReplacement";
  if (action === "complete_replacement") return "completeReplacement";
  if (action === "cancel_replacement") return "cancelReplacement";
  if (action === "cleanup_replacement") return "cleanupReplacement";
  return action;
}

export default function ClientDomainManager({
  businessId,
}: {
  businessId: string;
}) {
  const [payload, setPayload] = useState<DomainManagementPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [replacementInput, setReplacementInput] = useState("");
  const [showReplacementForm, setShowReplacementForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    if (!businessId) {
      setError("Сайт не выбран. Вернитесь в кабинет и откройте подключение домена заново.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/client/domains?businessId=${encodeURIComponent(businessId)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as
        | DomainManagementPayload
        | ClientDomainErrorPayload;

      if (!response.ok || data.ok !== true) {
        throw new Error(responseMessage(data as ClientDomainErrorPayload));
      }

      setPayload(data as DomainManagementPayload);
      setDomainInput((data as DomainManagementPayload).domain?.domain || "");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить настройки домена.",
      );
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 7_000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const domain = payload?.domain || null;
  const replacement = payload?.replacement || null;
  const domainStatus = domain ? STATUS[domain.status] : null;
  const replacementStatus = replacement ? STATUS[replacement.status] : null;

  const domainVerificationRecords = useMemo(
    () =>
      domain?.dns_records.filter((record) => record.purpose === "verification") ||
      [],
    [domain],
  );
  const domainRoutingRecords = useMemo(
    () =>
      domain?.dns_records.filter((record) => record.purpose !== "verification") ||
      [],
    [domain],
  );
  const replacementVerificationRecords = useMemo(
    () =>
      replacement?.dns_records.filter(
        (record) => record.purpose === "verification",
      ) || [],
    [replacement],
  );
  const replacementRoutingRecords = useMemo(
    () =>
      replacement?.dns_records.filter(
        (record) => record.purpose !== "verification",
      ) || [],
    [replacement],
  );

  async function runAction(action: DomainAction, domainValue?: string) {
    setBusy(actionBusy(action));
    setError("");
    setMessage("");

    try {
      let data: DomainManagementPayload | null = null;
      const attempts =
        action === "check" || action === "check_replacement" ? 6 : 1;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const response = await fetch("/api/client/domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            businessId,
            ...(domainValue ? { domain: domainValue } : {}),
          }),
        });
        const nextData = (await response.json()) as
          | DomainManagementPayload
          | ClientDomainErrorPayload;

        if (!response.ok || nextData.ok !== true) {
          throw new Error(responseMessage(nextData as ClientDomainErrorPayload));
        }

        data = nextData as DomainManagementPayload;
        setPayload(data);

        const watchedDomain =
          action === "check_replacement" ? data.replacement : data.domain;

        if (
          !["check", "check_replacement"].includes(action) ||
          watchedDomain?.status === "active" ||
          watchedDomain?.dns_configured !== true ||
          watchedDomain?.ssl_ready === true
        ) {
          break;
        }

        setMessage(
          "DNS уже готов. OneStudio ожидает выпуск HTTPS-сертификата и проверит его автоматически.",
        );
        await new Promise((resolve) => window.setTimeout(resolve, 5_000));
      }

      if (!data) throw new Error("Не удалось получить состояние домена.");

      if (action === "connect") {
        setMessage(
          data.domain?.status === "active"
            ? "Домен подключён. HTTPS работает, сайт уже можно открыть."
            : "Домен добавлен. Внесите показанные DNS-записи и повторите проверку.",
        );
      } else if (action === "check") {
        setMessage(
          data.domain?.status === "active"
            ? "Домен подключён. HTTPS работает."
            : "Данные обновлены. Проверьте показанные DNS-записи.",
        );
      } else if (action === "start_replacement") {
        setShowReplacementForm(false);
        setReplacementInput("");
        setMessage(
          "Новый домен добавлен. Действующий адрес продолжит работать до завершения замены.",
        );
      } else if (action === "check_replacement") {
        setMessage(
          data.replacement?.status === "active"
            ? "Новый домен готов. Теперь его можно сделать основным."
            : "Проверка обновлена. Действующий домен продолжает работать.",
        );
      } else if (action === "complete_replacement") {
        setShowReplacementForm(false);
        setMessage(
          data.warning ||
            (data.replacement?.phase === "cleanup_pending"
              ? "Новый домен уже работает. OneStudio завершает отключение старого адреса."
              : "Новый домен включён, старый домен отключён."),
        );
      } else if (action === "cancel_replacement") {
        setShowReplacementForm(false);
        setReplacementInput("");
        setMessage("Замена отменена. Действующий домен не изменился.");
      } else if (action === "cleanup_replacement") {
        setMessage("Старый домен отключён. Замена полностью завершена.");
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Не удалось выполнить действие.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function removeDomain() {
    const currentDomain = payload?.domain?.domain;
    if (!currentDomain) return;

    const replacementText = payload?.replacement
      ? " Незавершённая замена также будет отменена."
      : "";

    if (
      !window.confirm(
        `Отключить ${currentDomain}? Сайт продолжит работать по адресу OneStudio OS.${replacementText} DNS-записи у регистратора автоматически не удаляются.`,
      )
    ) {
      return;
    }

    setBusy("remove");
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/client/domains?businessId=${encodeURIComponent(businessId)}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as
        | { ok: true; removed: boolean }
        | ClientDomainErrorPayload;

      if (!response.ok || data.ok !== true) {
        throw new Error(responseMessage(data as ClientDomainErrorPayload));
      }

      setPayload((current) =>
        current ? { ...current, domain: null, replacement: null } : current,
      );
      setDomainInput("");
      setReplacementInput("");
      setShowReplacementForm(false);
      setMessage("Домен отключён. Сайт остаётся доступен по адресу OneStudio OS.");
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Не удалось отключить домен.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  if (loading) {
    return (
      <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-8">
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 h-10 max-w-md animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-8 h-44 animate-pulse rounded-[26px] bg-white/[0.06]" />
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="rounded-[34px] border border-red-300/15 bg-red-300/[0.06] p-8">
        <p className="text-sm leading-6 text-red-100">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {message ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-[100] max-w-[calc(100vw-2rem)] rounded-2xl border border-emerald-300/25 bg-[#102019]/95 px-5 py-4 text-sm font-medium leading-6 text-emerald-100 shadow-2xl backdrop-blur sm:right-6 sm:top-6 sm:max-w-md"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-100"
            >
              ✓
            </span>
            <div>
              <p className="font-semibold">Готово</p>
              <p className="mt-1 text-emerald-100/80">{message}</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,179,106,0.16),transparent_42%),rgba(255,255,255,0.045)]">
        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d8b36a]">
            Domain Replacement 1.0
          </p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Собственный домен
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                Подключайте, отключайте и заменяйте адрес сайта без передачи всей DNS-зоны. При замене старый домен остаётся рабочим, пока новый не получит HTTPS.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Проект
              </p>
              <p className="mt-1 text-sm font-semibold">{payload.business.name}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-300/20 bg-red-400/[0.08] px-5 py-4 text-sm leading-6 text-red-100"
        >
          {error}
        </div>
      ) : null}

      {!payload.business.isPublished ? (
        <section className="rounded-[30px] border border-amber-300/15 bg-amber-300/[0.06] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.035em]">
            Сначала опубликуйте сайт
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Домен подключается к публичной версии. Черновики останутся закрытыми и после подключения.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12]"
          >
            Вернуться к публикации
          </Link>
        </section>
      ) : !domain ? (
        <ConnectDomainCard
          value={domainInput}
          busy={busy === "connect"}
          disabled={busy !== null}
          onChange={setDomainInput}
          onConnect={() => void runAction("connect", domainInput)}
        />
      ) : (
        <>
          <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Действующий домен
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="break-all text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                    {domain.domain}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${domainStatus?.className || ""}`}
                  >
                    {domainStatus?.label}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  {domain.dns_configured && !domain.ssl_ready
                    ? "DNS уже подключён. OneStudio автоматически ожидает и проверяет выпуск HTTPS-сертификата."
                    : domainStatus?.description}
                </p>
                {domain.redirect_domain ? (
                  <p className="mt-2 text-xs text-white/35">
                    Второй адрес {domain.redirect_domain} перенаправляет посетителей на основной.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {domain.status === "active" ? (
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12]"
                  >
                    Открыть ↗
                  </a>
                ) : null}
                {!replacement ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => setShowReplacementForm((current) => !current)}
                    className="inline-flex min-h-11 items-center rounded-full border border-[#d8b36a]/35 px-5 text-sm font-semibold text-[#e8c77f] disabled:opacity-45"
                  >
                    Заменить домен
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void removeDomain()}
                  className="inline-flex min-h-11 items-center rounded-full border border-red-300/20 px-5 text-sm font-semibold text-red-100 disabled:opacity-45"
                >
                  {busy === "remove" ? "Отключаем…" : "Отключить домен"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatusCard label="Владение" ready={domain.vercel_verified} />
              <StatusCard label="DNS" ready={domain.dns_configured} />
              <StatusCard label="HTTPS" ready={domain.ssl_ready} />
            </div>

            {showReplacementForm && !replacement ? (
              <div className="mt-6 rounded-[24px] border border-[#d8b36a]/20 bg-[#d8b36a]/[0.06] p-5 sm:p-6">
                <p className="text-sm font-semibold text-[#f0d89f]">
                  Новый домен без отключения старого
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-5 text-white/45">
                  Старый адрес останется рабочим. OneStudio переключит сайт только после готовности DNS и HTTPS нового домена.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={replacementInput}
                    onChange={(event) => setReplacementInput(event.target.value)}
                    placeholder="new-domain.pl"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="min-h-12 flex-1 rounded-2xl border border-white/12 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d8b36a]/60"
                  />
                  <button
                    type="button"
                    disabled={busy !== null || !replacementInput.trim()}
                    onClick={() =>
                      void runAction("start_replacement", replacementInput)
                    }
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f7f5ef] px-6 text-sm font-semibold text-[#0b0d12] disabled:opacity-45"
                  >
                    {busy === "replace" ? "Добавляем…" : "Начать замену"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => {
                      setShowReplacementForm(false);
                      setReplacementInput("");
                    }}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-semibold text-white/60 disabled:opacity-45"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          {domain.status !== "active" ? (
            <>
              {domainVerificationRecords.length ? (
                <DnsSection
                  eyebrow="Сначала"
                  title="Подтвердите владение"
                  description="Добавьте TXT-запись у регистратора домена. Она не влияет на сайт или почту."
                  records={domainVerificationRecords}
                  copied={copied}
                  onCopy={copy}
                />
              ) : null}

              {domainRoutingRecords.length ? (
                <DnsSection
                  eyebrow={
                    domainVerificationRecords.length ? "Затем" : "DNS-записи"
                  }
                  title="Направьте домен на OneStudio"
                  description="Добавьте или замените только показанные записи. MX, SPF, DKIM и другие записи почты не удаляйте."
                  records={domainRoutingRecords}
                  copied={copied}
                  onCopy={copy}
                />
              ) : null}

              <CheckCard
                busy={busy === "check"}
                disabled={busy !== null}
                lastCheckedAt={domain.last_checked_at}
                lastError={domain.last_error}
                onCheck={() => void runAction("check")}
              />
            </>
          ) : null}

          {replacement ? (
            replacement.phase === "cleanup_pending" ? (
              <CleanupPendingCard
                replacement={replacement}
                busy={busy === "cleanupReplacement"}
                disabled={busy !== null}
                onCleanup={() => void runAction("cleanup_replacement")}
              />
            ) : (
              <>
                <section className="rounded-[30px] border border-sky-300/15 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.11),transparent_38%),rgba(255,255,255,0.035)] p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/70">
                        Замена без простоя
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <h2 className="break-all text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                          {replacement.candidate_domain}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${replacementStatus?.className || ""}`}
                        >
                          {replacementStatus?.label}
                        </span>
                      </div>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                        {replacementStatus?.description}
                      </p>
                      <p className="mt-3 rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.05] px-4 py-3 text-xs leading-5 text-emerald-100/80">
                        {replacement.current_domain} продолжает работать до окончательного переключения.
                      </p>
                    </div>
                    {replacement.status === "active" ? (
                      <a
                        href={`https://${replacement.candidate_domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/75"
                      >
                        Проверить новый ↗
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <StatusCard
                      label="Владение"
                      ready={replacement.vercel_verified}
                    />
                    <StatusCard label="DNS" ready={replacement.dns_configured} />
                    <StatusCard label="HTTPS" ready={replacement.ssl_ready} />
                  </div>
                </section>

                {replacementVerificationRecords.length ? (
                  <DnsSection
                    eyebrow="Новый домен · сначала"
                    title="Подтвердите владение новым доменом"
                    description="Добавьте TXT-запись. Действующий домен и почта продолжат работать как раньше."
                    records={replacementVerificationRecords}
                    copied={copied}
                    onCopy={copy}
                  />
                ) : null}

                {replacementRoutingRecords.length ? (
                  <DnsSection
                    eyebrow="Новый домен · DNS"
                    title="Направьте новый домен на OneStudio"
                    description="Меняйте только показанные записи нового домена. Записи старого домена пока не трогайте."
                    records={replacementRoutingRecords}
                    copied={copied}
                    onCopy={copy}
                  />
                ) : null}

                <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Завершение замены</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                        Сначала проверьте новый домен. Кнопка переключения станет доступна только после готовности HTTPS.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void runAction("check_replacement")}
                        className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/75 disabled:opacity-45"
                      >
                        {busy === "checkReplacement"
                          ? "Проверяем…"
                          : "Проверить новый домен"}
                      </button>
                      <button
                        type="button"
                        disabled={
                          busy !== null ||
                          replacement.status !== "active" ||
                          !replacement.ssl_ready
                        }
                        onClick={() => void runAction("complete_replacement")}
                        className="inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] disabled:opacity-40"
                      >
                        {busy === "completeReplacement"
                          ? "Переключаем…"
                          : "Сделать новым доменом"}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void runAction("cancel_replacement")}
                        className="inline-flex min-h-11 items-center rounded-full border border-red-300/18 px-5 text-sm font-semibold text-red-100 disabled:opacity-45"
                      >
                        {busy === "cancelReplacement"
                          ? "Отменяем…"
                          : "Отменить замену"}
                      </button>
                    </div>
                  </div>

                  {replacement.last_checked_at ? (
                    <p className="mt-4 text-xs text-white/30">
                      Последняя проверка: {new Date(replacement.last_checked_at).toLocaleString("ru-RU")}
                    </p>
                  ) : null}

                  {replacement.last_error ? (
                    <div className="mt-4 rounded-2xl border border-red-300/15 bg-red-300/[0.06] p-4 text-xs leading-5 text-red-100">
                      Последняя проверка: {replacement.last_error}
                    </div>
                  ) : null}
                </section>
              </>
            )
          ) : null}

          <details className="rounded-[30px] border border-white/10 bg-white/[0.025] p-6">
            <summary className="cursor-pointer text-sm font-semibold text-white/75">
              Управляемый DNS OneStudio
            </summary>
            <div className="mt-4 rounded-2xl border border-amber-300/12 bg-amber-300/[0.05] p-4 text-xs leading-6 text-white/50">
              <p>
                Пока оставьте NS у текущего провайдера и меняйте только показанные A, CNAME или TXT-записи.
              </p>
              <div className="mt-4 grid gap-2 font-mono text-white/75">
                <p>ns1.onestudioos.com</p>
                <p>ns2.onestudioos.com</p>
              </div>
              <p className="mt-4 text-amber-100/75">
                Эти NS пока не устанавливайте. Они будут доступны после запуска OneStudio Managed DNS.
              </p>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

function ConnectDomainCard({
  value,
  busy,
  disabled,
  onChange,
  onConnect,
}: {
  value: string;
  busy: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onConnect: () => void;
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <div className="grid gap-7 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b36a]">
            Шаг 1
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
            Введите адрес сайта
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/50">
            Можно указать корневой домен или адрес с www. Протокол и путь вводить не нужно.
          </p>

          <label className="mt-6 block">
            <span className="text-xs font-semibold text-white/60">Домен</span>
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="mystudio.pl"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="mt-2 min-h-14 w-full rounded-2xl border border-white/12 bg-black/20 px-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#d8b36a]/60"
            />
          </label>

          <button
            type="button"
            disabled={disabled || !value.trim()}
            onClick={onConnect}
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#f7f5ef] px-6 text-sm font-semibold text-[#0b0d12] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? "Добавляем домен…" : "Подключить домен"}
          </button>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/15 p-5">
          <p className="text-sm font-semibold">Что произойдёт</p>
          <div className="mt-4 grid gap-4 text-xs leading-5 text-white/45">
            <p>1. OneStudio добавит адрес к проекту Vercel.</p>
            <p>2. Вы получите точные A, CNAME или TXT-записи.</p>
            <p>3. После проверки сайт откроется по домену с HTTPS.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CleanupPendingCard({
  replacement,
  busy,
  disabled,
  onCleanup,
}: {
  replacement: DomainReplacementRecord;
  busy: boolean;
  disabled: boolean;
  onCleanup: () => void;
}) {
  return (
    <section className="rounded-[30px] border border-emerald-300/15 bg-emerald-300/[0.05] p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100/70">
        Новый домен уже включён
      </p>
      <h2 className="mt-3 break-all text-2xl font-semibold tracking-[-0.035em]">
        {replacement.candidate_domain}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
        Сайт уже работает по новому адресу. Осталось завершить отключение старого домена {replacement.current_domain} в Vercel.
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={onCleanup}
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] disabled:opacity-45"
      >
        {busy ? "Завершаем…" : "Завершить отключение старого домена"}
      </button>
      {replacement.last_error ? (
        <p className="mt-4 text-xs leading-5 text-amber-100/75">
          Последняя попытка: {replacement.last_error}
        </p>
      ) : null}
    </section>
  );
}

function CheckCard({
  busy,
  disabled,
  lastCheckedAt,
  lastError,
  onCheck,
}: {
  busy: boolean;
  disabled: boolean;
  lastCheckedAt: string | null;
  lastError: string | null;
  onCheck: () => void;
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Проверка подключения</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            После сохранения DNS-записей нажмите проверку. Изменения у регистратора появляются не мгновенно.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onCheck}
          className="inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] disabled:opacity-45"
        >
          {busy ? "Проверяем…" : "Проверить подключение"}
        </button>
      </div>

      {lastCheckedAt ? (
        <p className="mt-4 text-xs text-white/30">
          Последняя проверка: {new Date(lastCheckedAt).toLocaleString("ru-RU")}
        </p>
      ) : null}

      {lastError === "https_certificate_pending" ? (
        <div className="mt-4 rounded-2xl border border-sky-300/15 bg-sky-300/[0.06] p-4 text-xs leading-5 text-sky-100">
          DNS уже принят. HTTPS-сертификат выпускается автоматически. Ручные команды не нужны.
        </div>
      ) : lastError ? (
        <div className="mt-4 rounded-2xl border border-red-300/15 bg-red-300/[0.06] p-4 text-xs leading-5 text-red-100">
          Последняя проверка не завершилась: {lastError}
        </div>
      ) : null}
    </section>
  );
}

function StatusCard({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-semibold ${ready ? "text-emerald-100" : "text-amber-100"}`}
      >
        {ready ? "Готово ✓" : "Ожидаем"}
      </p>
    </div>
  );
}

function DnsSection({
  eyebrow,
  title,
  description,
  records,
  copied,
  onCopy,
}: {
  eyebrow: string;
  title: string;
  description: string;
  records: DomainDnsRecord[];
  copied: string;
  onCopy: (value: string, key: string) => Promise<void>;
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b36a]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/48">
        {description}
      </p>

      <div className="mt-6 grid gap-3">
        {records.map((record, index) => {
          const key = `${record.type}-${record.name}-${record.value}-${index}`;
          return (
            <div
              key={key}
              className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 md:grid-cols-[90px_1fr_1.5fr_auto] md:items-center"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                  Тип
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#e8c77f]">
                  {record.type}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                  Имя
                </p>
                <p className="mt-1 break-all font-mono text-sm text-white/80">
                  {record.name}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                  Значение
                </p>
                <p className="mt-1 break-all font-mono text-sm text-white/80">
                  {record.value}
                </p>
                <p className="mt-1 text-[10px] text-white/30">
                  {recordPurpose(record)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onCopy(record.value, key)}
                className="min-h-9 rounded-full border border-white/12 px-3 text-xs font-semibold text-white/65 transition hover:border-white/25 hover:text-white"
              >
                {copied === key ? "Скопировано ✓" : "Копировать"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

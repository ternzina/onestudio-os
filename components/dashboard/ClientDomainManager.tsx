"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ClientDomainErrorPayload,
  ClientDomainPayload,
  ClientDomainRecord,
  DomainDnsRecord,
  DomainStatus,
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
    description: "Домен подтверждён, направлен на OneStudio и готов к HTTPS.",
    className: "bg-emerald-300/12 text-emerald-100",
  },
  error: {
    label: "Нужна проверка",
    description: "Последняя проверка завершилась ошибкой. Данные сайта не затронуты.",
    className: "bg-red-300/12 text-red-100",
  },
};

function responseMessage(payload: ClientDomainErrorPayload | null) {
  return payload?.message || "Не удалось выполнить действие.";
}

function recordPurpose(record: DomainDnsRecord) {
  if (record.purpose === "verification") return "Подтверждение владения";
  if (record.purpose === "redirect") return "Переадресация второго адреса";
  return "Основной адрес сайта";
}

export default function ClientDomainManager({
  businessId,
}: {
  businessId: string;
}) {
  const [payload, setPayload] = useState<ClientDomainPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"connect" | "check" | "remove" | null>(null);
  const [domainInput, setDomainInput] = useState("");
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
        | ClientDomainPayload
        | ClientDomainErrorPayload;

      if (!response.ok || data.ok !== true) {
        throw new Error(responseMessage(data as ClientDomainErrorPayload));
      }

      setPayload(data);
      setDomainInput(data.domain?.domain || "");
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

  const status = payload?.domain ? STATUS[payload.domain.status] : null;
  const verificationRecords = useMemo(
    () =>
      payload?.domain?.dns_records.filter(
        (record) => record.purpose === "verification",
      ) || [],
    [payload?.domain],
  );
  const routingRecords = useMemo(
    () =>
      payload?.domain?.dns_records.filter(
        (record) => record.purpose !== "verification",
      ) || [],
    [payload?.domain],
  );

  async function postAction(action: "connect" | "check") {
    setBusy(action);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/client/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          businessId,
          ...(action === "connect" ? { domain: domainInput } : {}),
        }),
      });
      const data = (await response.json()) as
        | ClientDomainPayload
        | ClientDomainErrorPayload;

      if (!response.ok || data.ok !== true) {
        throw new Error(responseMessage(data as ClientDomainErrorPayload));
      }

      setPayload(data);
      setDomainInput(data.domain?.domain || domainInput);
      setMessage(
        data.domain?.status === "active"
          ? "Домен подключён. Сайт уже можно открыть по новому адресу."
          : "Данные обновлены. Внесите показанные DNS-записи и повторите проверку.",
      );
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
    const domain = payload?.domain?.domain;
    if (!domain) return;
    if (
      !window.confirm(
        `Отключить ${domain}? Сайт продолжит работать по адресу OneStudio OS. DNS-записи у регистратора автоматически не удаляются.`,
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
        current ? { ...current, domain: null } : current,
      );
      setDomainInput("");
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

  const domain = payload.domain;

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,179,106,0.16),transparent_42%),rgba(255,255,255,0.045)]">
        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d8b36a]">
            Client Domain 1.0
          </p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Собственный домен
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                Подключите адрес клиента, не передавая OneStudio управление всей DNS-зоной. Почта и остальные сервисы домена останутся у текущего провайдера.
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
        <div role="alert" className="rounded-2xl border border-red-300/20 bg-red-400/[0.08] px-5 py-4 text-sm leading-6 text-red-100">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07] px-5 py-4 text-sm leading-6 text-emerald-100">
          {message}
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
                  value={domainInput}
                  onChange={(event) => setDomainInput(event.target.value)}
                  placeholder="mystudio.pl"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="mt-2 min-h-14 w-full rounded-2xl border border-white/12 bg-black/20 px-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#d8b36a]/60"
                />
              </label>

              <button
                type="button"
                disabled={busy !== null || !domainInput.trim()}
                onClick={() => void postAction("connect")}
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#f7f5ef] px-6 text-sm font-semibold text-[#0b0d12] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {busy === "connect" ? "Добавляем домен…" : "Подключить домен"}
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
      ) : (
        <>
          <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="break-all text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                    {domain.domain}
                  </h2>
                  <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${status?.className || ""}`}>
                    {status?.label}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  {status?.description}
                </p>
                {domain.redirect_domain ? (
                  <p className="mt-2 text-xs text-white/35">
                    Второй адрес {domain.redirect_domain} будет перенаправлять посетителей на основной.
                  </p>
                ) : null}
              </div>

              {domain.status === "active" ? (
                <a
                  href={`https://${domain.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12]"
                >
                  Открыть домен ↗
                </a>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatusCard label="Владение" ready={domain.vercel_verified} />
              <StatusCard label="DNS" ready={domain.dns_configured} />
              <StatusCard label="HTTPS" ready={domain.ssl_ready} />
            </div>
          </section>

          {verificationRecords.length ? (
            <DnsSection
              eyebrow="Сначала"
              title="Подтвердите владение"
              description="Добавьте TXT-запись у регистратора домена. Она не влияет на сайт или почту."
              records={verificationRecords}
              copied={copied}
              onCopy={copy}
            />
          ) : null}

          {routingRecords.length ? (
            <DnsSection
              eyebrow={verificationRecords.length ? "Затем" : "DNS-записи"}
              title="Направьте домен на OneStudio"
              description="Добавьте или замените только показанные записи. MX, SPF, DKIM и другие записи почты не удаляйте."
              records={routingRecords}
              copied={copied}
              onCopy={copy}
            />
          ) : null}

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
                disabled={busy !== null}
                onClick={() => void postAction("check")}
                className="inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] disabled:opacity-45"
              >
                {busy === "check" ? "Проверяем…" : "Проверить подключение"}
              </button>
            </div>

            {domain.last_checked_at ? (
              <p className="mt-4 text-xs text-white/30">
                Последняя проверка: {new Date(domain.last_checked_at).toLocaleString("ru-RU")}
              </p>
            ) : null}
          </section>

          <details className="rounded-[30px] border border-white/10 bg-white/[0.025] p-6">
            <summary className="cursor-pointer text-sm font-semibold text-white/75">
              Расширенный способ: передать DNS в Vercel
            </summary>
            <div className="mt-4 rounded-2xl border border-amber-300/12 bg-amber-300/[0.05] p-4 text-xs leading-6 text-white/50">
              <p>
                Этот способ меняет управление всей зоной домена. Перед сменой NS необходимо перенести MX, SPF, DKIM и остальные существующие записи, иначе может перестать работать почта.
              </p>
              <div className="mt-4 grid gap-2 font-mono text-white/75">
                <p>ns1.vercel-dns.com</p>
                <p>ns2.vercel-dns.com</p>
              </div>
            </div>
          </details>

          <section className="rounded-[30px] border border-red-300/10 bg-red-300/[0.025] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-100">Отключить домен</p>
                <p className="mt-1 text-xs leading-5 text-white/35">
                  Сайт продолжит работать по адресу OneStudio OS. DNS у регистратора останется без изменений.
                </p>
              </div>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void removeDomain()}
                className="inline-flex min-h-10 items-center rounded-full border border-red-300/20 px-4 text-xs font-semibold text-red-100 disabled:opacity-40"
              >
                {busy === "remove" ? "Отключаем…" : "Отключить"}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatusCard({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${ready ? "text-emerald-100" : "text-amber-100"}`}>
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
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/48">{description}</p>

      <div className="mt-6 grid gap-3">
        {records.map((record, index) => {
          const key = `${record.type}-${record.name}-${record.value}-${index}`;
          return (
            <div key={key} className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 md:grid-cols-[90px_1fr_1.5fr_auto] md:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">Тип</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#e8c77f]">{record.type}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">Имя</p>
                <p className="mt-1 break-all font-mono text-sm text-white/80">{record.name}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">Значение</p>
                <p className="mt-1 break-all font-mono text-sm text-white/80">{record.value}</p>
                <p className="mt-1 text-[10px] text-white/30">{recordPurpose(record)}</p>
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

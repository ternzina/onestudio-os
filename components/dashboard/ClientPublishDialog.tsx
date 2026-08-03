"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  PublicationCheck,
  PublicationReadiness,
} from "@/lib/public-site/publication-readiness";
import { publicationLocaleLabel } from "@/lib/public-site/publication-readiness";

type ClientPublishDialogProps = {
  open: boolean;
  businessId: string;
  businessName: string;
  locale: string;
  publicPath: string;
  alreadyPublished: boolean;
  busy: boolean;
  success: boolean;
  readiness: PublicationReadiness;
  error?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  onEdit: () => void;
};

function checkTone(check: PublicationCheck) {
  if (check.status === "ready") {
    return {
      icon: "✓",
      iconClass: "bg-emerald-400/15 text-emerald-200",
      borderClass: "border-emerald-300/10",
    };
  }

  if (check.status === "blocked") {
    return {
      icon: "!",
      iconClass: "bg-red-400/15 text-red-200",
      borderClass: "border-red-300/15",
    };
  }

  return {
    icon: "•",
    iconClass: "bg-amber-300/15 text-amber-100",
    borderClass: "border-amber-200/10",
  };
}

export default function ClientPublishDialog({
  open,
  businessId,
  businessName,
  locale,
  publicPath,
  alreadyPublished,
  busy,
  success,
  readiness,
  error,
  onClose,
  onConfirm,
  onEdit,
}: ClientPublishDialogProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    setCopied(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [busy, onClose, open, success]);

  if (!open) return null;

  async function copyPublicAddress() {
    const absoluteUrl = new URL(publicPath, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const actionName = alreadyPublished ? "Обновить сайт" : "Опубликовать сайт";

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#05070a]/80 px-4 py-8 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !busy) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-publish-dialog-title"
        className="w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/12 bg-[#101319] text-[#f7f5ef] shadow-[0_45px_140px_rgba(0,0,0,0.52)]"
      >
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,179,106,0.16),transparent_38%)] px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d8b36a]">
                {success ? "Публикация завершена" : "Перед запуском"}
              </p>
              <h2
                id="client-publish-dialog-title"
                className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
              >
                {success
                  ? alreadyPublished
                    ? "Сайт обновлён"
                    : "Сайт опубликован"
                  : alreadyPublished
                    ? "Проверка перед обновлением"
                    : "Проверка перед публикацией"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                {success
                  ? `«${businessName}» уже доступен посетителям по рабочему адресу.`
                  : "Проверьте язык, адрес и основные элементы. Рекомендации не мешают запуску, а красная проверка остановит публикацию."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/12 text-lg text-white/60 transition hover:border-white/30 hover:text-white disabled:opacity-40"
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">Закрыть</span>
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-6 sm:p-8">
            <div className="rounded-[26px] border border-emerald-300/15 bg-emerald-300/[0.06] p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xl text-emerald-100">
                  ✓
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-100">
                    Публичная версия готова
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    Язык: {publicationLocaleLabel(locale)}. Изменения в редакторе останутся черновиком, пока вы снова не обновите публикацию.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Адрес сайта
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-[#e8c77f]">
                onestudioos.com{publicPath}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={publicPath}
                target="_blank"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white"
              >
                Открыть сайт ↗
              </Link>
              <button
                type="button"
                onClick={() => void copyPublicAddress()}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 px-5 text-sm font-semibold text-white/85 transition hover:border-white/30"
              >
                {copied ? "Ссылка скопирована ✓" : "Скопировать ссылку"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b36a]/30 bg-[#d8b36a]/[0.06] px-5 text-sm font-semibold text-[#e8c77f]"
              >
                Готово
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Собственный домен</p>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    Подключите адрес клиента и получите точные A, CNAME или TXT-записи.
                  </p>
                </div>
                <Link
                  href={`/dashboard/domain?business=${businessId}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-[#d8b36a]/30 bg-[#d8b36a]/[0.06] px-4 text-xs font-semibold text-[#e8c77f]"
                >
                  Подключить домен →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Язык публикации
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {publicationLocaleLabel(locale)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Рабочий адрес
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-[#e8c77f]">
                  onestudioos.com{publicPath}
                </p>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/[0.08] px-4 py-3 text-sm leading-6 text-red-100"
              >
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 font-semibold text-emerald-100">
                Готово: {readiness.readyCount}
              </span>
              {readiness.warningCount ? (
                <span className="rounded-full bg-amber-300/10 px-3 py-1.5 font-semibold text-amber-100">
                  Рекомендации: {readiness.warningCount}
                </span>
              ) : null}
              {readiness.blockedCount ? (
                <span className="rounded-full bg-red-400/10 px-3 py-1.5 font-semibold text-red-100">
                  Нужно исправить: {readiness.blockedCount}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3">
              {readiness.checks.map((check) => {
                const tone = checkTone(check);
                return (
                  <div
                    key={check.id}
                    className={`rounded-2xl border bg-black/15 p-4 ${tone.borderClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${tone.iconClass}`}
                      >
                        {tone.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{check.label}</p>
                        <p className="mt-1 text-xs leading-5 text-white/42">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onEdit}
                disabled={busy}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 px-5 text-sm font-semibold text-white/80 transition hover:border-white/30 disabled:opacity-40"
              >
                Вернуться в редактор
              </button>
              <button
                type="button"
                onClick={() => void onConfirm()}
                disabled={busy || !readiness.canPublish}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f7f5ef] px-6 text-sm font-semibold text-[#0b0d12] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy
                  ? alreadyPublished
                    ? "Обновляем…"
                    : "Публикуем…"
                  : actionName}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

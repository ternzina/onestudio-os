"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type GalleryData = {
  pixover_url: string;
  access_password: string | null;
  public_token: string;
  status: "draft" | "sent";
  sent_at: string | null;
};

type Props = {
  bookingId: string;
  clientName: string;
  clientEmail: string;
};

export default function PixoverGalleryPanel({
  bookingId,
  clientName,
  clientEmail,
}: Props) {
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [pixoverUrl, setPixoverUrl] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<"save" | "send" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadGallery() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        if (isActive) {
          setError("Не удалось проверить вход администратора.");
          setIsLoading(false);
        }
        return;
      }

      const response = await fetch(
        `/api/admin/pixover-gallery?bookingId=${encodeURIComponent(bookingId)}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        },
      );
      const result = await response.json().catch(() => ({}));

      if (!isActive) return;

      if (!response.ok) {
        setError(result.error || "Не удалось загрузить галерею.");
        setIsLoading(false);
        return;
      }

      if (result.gallery) {
        setGallery(result.gallery);
        setPixoverUrl(result.gallery.pixover_url || "");
        setPassword(result.gallery.access_password || "");
      }

      setIsLoading(false);
    }

    loadGallery();
    return () => {
      isActive = false;
    };
  }, [bookingId]);

  const saveGallery = async (sendEmail: boolean) => {
    setMessage("");
    setError("");

    let normalizedUrl = pixoverUrl.trim();
    if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const parsedUrl = new URL(normalizedUrl);
      if (parsedUrl.protocol !== "https:") throw new Error();
    } catch {
      setError("Вставьте полную безопасную ссылку на галерею Pixover.");
      return;
    }

    if (sendEmail && !clientEmail) {
      setError("У этой брони нет email клиента. Сначала добавьте email.");
      return;
    }

    setAction(sendEmail ? "send" : "save");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Сессия администратора закончилась. Войдите снова.");
      setAction(null);
      return;
    }

    const response = await fetch("/api/admin/pixover-gallery", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        pixoverUrl: normalizedUrl,
        password: password.trim(),
        sendEmail,
      }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(result.error || "Не удалось сохранить галерею.");
      setAction(null);
      return;
    }

    setGallery(result.gallery);
    setPixoverUrl(result.gallery.pixover_url || normalizedUrl);
    setPassword(result.gallery.access_password || "");
    setMessage(
      sendEmail
        ? `Письмо отправлено клиенту ${clientEmail}.`
        : "Галерея сохранена.",
    );
    setAction(null);
  };

  const publicGalleryUrl = gallery?.public_token
    ? `/gallery/${gallery.public_token}`
    : "";

  return (
    <div className="mt-5 max-w-3xl rounded-2xl border border-[#D8B4A0] bg-[#FFF8F2] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A05F42]">
            Галерея клиента · Pixover
          </p>
          <p className="mt-2 text-sm text-[#6E5748]">
            {clientName} · {clientEmail || "email не указан"}
          </p>
        </div>

        {gallery && (
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              gallery.status === "sent"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-[#D8C4B3] bg-white text-[#7A6252]"
            }`}
          >
            {gallery.status === "sent" ? "Отправлена" : "Черновик"}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#7A6252]">Проверяем галерею...</p>
      ) : (
        <>
          <label className="mt-4 block text-xs font-medium uppercase tracking-[0.12em] text-[#7A6252]">
            Ссылка на галерею Pixover
            <input
              type="url"
              value={pixoverUrl}
              onChange={(event) => setPixoverUrl(event.target.value)}
              placeholder="https://название.pixover.art/..."
              className="mt-2 w-full rounded-xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm normal-case tracking-normal text-[#2B1A12] outline-none transition focus:border-[#A05F42]"
            />
          </label>

          <label className="mt-3 block text-xs font-medium uppercase tracking-[0.12em] text-[#7A6252]">
            Пароль, если установлен
            <input
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Можно оставить пустым"
              className="mt-2 w-full rounded-xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm normal-case tracking-normal text-[#2B1A12] outline-none transition focus:border-[#A05F42]"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </p>
          )}

          {gallery?.sent_at && (
            <p className="mt-3 text-xs text-[#7A6252]">
              Последняя отправка:{" "}
              {new Date(gallery.sent_at).toLocaleString("ru-RU")}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => saveGallery(false)}
              disabled={Boolean(action)}
              className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-white disabled:opacity-60"
            >
              {action === "save" ? "Сохраняем..." : "Сохранить"}
            </button>

            <button
              type="button"
              onClick={() => saveGallery(true)}
              disabled={Boolean(action) || !clientEmail}
              className="rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === "send"
                ? "Отправляем..."
                : gallery?.status === "sent"
                  ? "Отправить повторно"
                  : "Сохранить и отправить"}
            </button>

            {gallery?.pixover_url && (
              <a
                href={gallery.pixover_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[#7A6252] transition hover:border-[#2B1A12]"
              >
                Открыть Pixover
              </a>
            )}

            {publicGalleryUrl && (
              <a
                href={publicGalleryUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[#7A6252] transition hover:border-[#2B1A12]"
              >
                Страница клиента
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

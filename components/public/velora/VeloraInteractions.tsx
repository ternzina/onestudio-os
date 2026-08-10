"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { VeloraItem } from "@/lib/public-site/velora-premium-template-content";
import styles from "./Velora.module.css";

export function VeloraAvailability({ businessSlug, venues, label }: { businessSlug: string; venues: VeloraItem[]; label: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending"); const data = new FormData(event.currentTarget);
    const message = `Дата: ${data.get("date")}. Формат: ${data.get("eventType")}. Гостей: ${data.get("guests")}. Зал: ${data.get("venue")}.`;
    const { error } = await getSupabaseBrowserClient().rpc("create_public_request", { p_business_slug: businessSlug, p_client_name: String(data.get("name") ?? "Гость VELORA"), p_client_email: String(data.get("email") ?? ""), p_client_phone: String(data.get("phone") ?? "") || null, p_client_locale: "ru", p_business_type: "event_venue", p_subject: "Проверка даты VELORA HOUSE", p_message: message, p_request_key: crypto.randomUUID() });
    setStatus(error ? "error" : "sent");
  }
  return <form className={styles.availabilityForm} onSubmit={submit} aria-label="Проверить свободную дату">
    <label>Дата<input name="date" type="date" required /></label><label>Тип события<select name="eventType" required defaultValue=""><option value="" disabled>Выберите формат</option><option>Свадьба</option><option>День рождения</option><option>Корпоратив</option><option>Камерный ужин</option><option>Презентация</option></select></label>
    <label>Количество гостей<input name="guests" type="number" min="2" max="220" inputMode="numeric" required placeholder="80" /></label><label>Зал<select name="venue" defaultValue="Любой подходящий"><option>Любой подходящий</option>{venues.map(venue => <option key={venue.name}>{venue.name}</option>)}</select></label>
    <label>Ваше имя<input name="name" autoComplete="name" required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label className={styles.full}>Телефон<input name="phone" type="tel" autoComplete="tel" /></label>
    <button disabled={status === "sending"} type="submit">{status === "sending" ? "Отправляем…" : label}</button><p className={styles.formStatus} aria-live="polite">{status === "sent" ? "Спасибо. Координатор свяжется с вами в течение рабочего дня." : status === "error" ? "Не удалось отправить заявку. Проверьте данные или свяжитесь с нами по телефону." : "Заявка не фиксирует дату без подтверждения координатора."}</p>
  </form>;
}

export function VeloraGallery({ items }: { items: VeloraItem[] }) {
  const [active, setActive] = useState<number | null>(null); const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (active === null) return; closeRef.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setActive(null); if (event.key === "ArrowRight") setActive(value => value === null ? null : (value + 1) % items.length); if (event.key === "ArrowLeft") setActive(value => value === null ? null : (value - 1 + items.length) % items.length); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [active, items.length]);
  return <><div className={styles.galleryGrid}>{items.map((item, index) => <button type="button" onClick={() => setActive(index)} key={`${item.image}-${index}`} aria-label={`Открыть: ${item.alt}`}><Image src={item.image} alt={item.alt} width={1200} height={900} sizes="(max-width: 768px) 100vw, 50vw" /></button>)}</div>{active !== null ? <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Просмотр галереи" onMouseDown={event => event.currentTarget === event.target && setActive(null)}><button ref={closeRef} type="button" onClick={() => setActive(null)} aria-label="Закрыть">×</button><Image src={items[active].image} alt={items[active].alt} width={1600} height={1100} sizes="90vw" /><p>{items[active].alt} · {active + 1}/{items.length}</p></div> : null}</>;
}

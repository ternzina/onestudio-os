"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { VowItem } from "@/lib/public-site/vow-premium-template-content";
import styles from "./Vow.module.css";

export function VowReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function VowAvailability({
  businessSlug,
  locale,
  copy,
  packages,
}: {
  businessSlug: string;
  locale: string;
  copy: VowItem;
  packages: VowItem[];
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const today = new Date();
  const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const data = new FormData(event.currentTarget);
    const message = locale === "en"
      ? `Date: ${data.get("date")}. Location: ${data.get("city")}. Collection: ${data.get("package")}. Details: ${data.get("message")}.`
      : `Дата: ${data.get("date")}. Город: ${data.get("city")}. Пакет: ${data.get("package")}. Детали: ${data.get("message")}.`;
    try {
      const { error } = await getSupabaseBrowserClient().rpc("create_public_request", {
        p_business_slug: businessSlug,
        p_client_name: String(data.get("name") ?? ""),
        p_client_email: String(data.get("email") ?? ""),
        p_client_phone: String(data.get("phone") ?? ""),
        p_client_locale: locale,
        p_business_type: "wedding_films",
        p_subject: copy.subject,
        p_message: message,
        p_request_key: crypto.randomUUID(),
      });
      setStatus(error ? "error" : "sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className={styles.availabilityForm} onSubmit={submit} aria-label={copy.ariaLabel}>
      <div className={styles.formGrid}>
        <label>
          {copy.dateLabel}
          <input name="date" type="date" min={minimumDate} required />
        </label>
        <label>
          {copy.cityLabel}
          <input name="city" placeholder={locale === "en" ? "Lake Como, Italy" : "Комо, Италия"} required />
        </label>
        <label>
          {copy.packageLabel}
          <select name="package" defaultValue="" required>
            <option value="" disabled>{copy.packagePlaceholder}</option>
            {packages.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <label>
          {copy.nameLabel}
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          {copy.emailLabel}
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          {copy.phoneLabel}
          <input name="phone" type="tel" autoComplete="tel" required />
        </label>
      </div>
      <label className={styles.messageField}>
        {copy.messageLabel}
        <textarea name="message" rows={4} />
      </label>
      <button disabled={status === "sending"} type="submit">
        {status === "sending" ? copy.pending : copy.submit}
      </button>
      <p className={styles.formStatus} role="status" aria-live="polite">
        {status === "sent" ? copy.success : status === "error" ? copy.error : copy.idle}
      </p>
    </form>
  );
}

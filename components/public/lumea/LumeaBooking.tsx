"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicSiteService } from "@/lib/public-site/types";
import styles from "./Lumea.module.css";

type Copy = Record<string, string>;

export default function LumeaBooking({
  bookingHref,
  services,
  copy,
}: {
  bookingHref: string;
  services: PublicSiteService[];
  copy: Copy;
}) {
  const router = useRouter();
  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "");
  const [date, setDate] = useState("");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function continueBooking() {
    const query = new URLSearchParams();
    if (serviceSlug) query.set("service", serviceSlug);
    if (date) query.set("date", date);
    router.push(`${bookingHref}${query.size ? `?${query.toString()}` : ""}`);
  }

  return (
    <div className={styles.bookingCard}>
      <span className={styles.eyebrow}>{copy.eyebrow}</span>
      <h2>{copy.title}</h2>
      <p>{copy.text}</p>
      <div className={styles.bookingGrid}>
        <label>
          <span>{copy.serviceLabel}</span>
          <select value={serviceSlug} onChange={(event) => setServiceSlug(event.target.value)}>
            {!services.length ? <option value="">{copy.servicePlaceholder}</option> : null}
            {services.map((service) => (
              <option key={service.id} value={service.slug}>{service.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{copy.masterLabel}</span>
          <select disabled aria-label={copy.masterLabel}>
            <option>{copy.masterPlaceholder}</option>
          </select>
        </label>
        <label>
          <span>{copy.dateLabel}</span>
          <input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label>
          <span>{copy.timeLabel}</span>
          <select disabled aria-label={copy.timeLabel}>
            <option>{copy.timePlaceholder}</option>
          </select>
        </label>
      </div>
      <button
        type="button"
        className={styles.bookingSubmit}
        onClick={continueBooking}
        disabled={!services.length}
      >
        {copy.submit}
      </button>
      <small className={styles.bookingNote}>✉ {copy.note}</small>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";

type GlobalSettings = {
  studio_name: string;
  logo_text: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  footer_text: string;
  notification_email: string;
};

type ContactSettings = {
  phone: string;
  email: string;
  address: string;
  hours: string;
  google_maps_query: string;
  nip: string;
  transfer_recipient: string;
  transfer_title: string;
  bank_account: string;
  blik: string;
  instagram: string;
  instagram_url: string;
};

type BookingSettings = {
  service_booking_enabled: boolean;
  service_open_hour: number;
  service_close_hour: number;
  service_duration_options: number[];
  resource_booking_enabled: boolean;
};

const fallbackGlobal: GlobalSettings = {
  studio_name: "OneStudio Demo",
  logo_text: "OneStudio Demo",
  instagram_url: "",
  tiktok_url: "",
  facebook_url: "",
  footer_text: "Independent business services with online booking.",
  notification_email: "hello@example-studio.test",
};

const fallbackContacts: ContactSettings = {
  phone: "+00000000000",
  email: "hello@example-studio.test",
  address: "Demo Street 10, Demo City",
  hours: "Daily 09:00-18:00",
  google_maps_query: "Demo Street 10, Demo City",
  nip: "",
  transfer_recipient: "",
  transfer_title: "",
  bank_account: "",
  blik: "",
  instagram: "",
  instagram_url: "",
};

const fallbackBooking: BookingSettings = {
  service_booking_enabled: true,
  service_open_hour: 10,
  service_close_hour: 18,
  service_duration_options: [1, 2, 3, 4, 5],
  resource_booking_enabled: true,
};

export default function AdminSettingsPage() {
  const [global, setGlobal] = useState<GlobalSettings>(fallbackGlobal);
  const [contacts, setContacts] = useState<ContactSettings>(fallbackContacts);
  const [booking, setBooking] = useState<BookingSettings>(fallbackBooking);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const [globalResult, contactsResult, bookingResult] = await Promise.all([
        supabase.from("site_global_settings").select("studio_name,logo_text,instagram_url,tiktok_url,facebook_url,footer_text,notification_email").eq("id", 1).maybeSingle(),
        supabase.from("site_contacts").select("phone,email,address,hours,google_maps_query,nip,transfer_recipient,transfer_title,bank_account,blik,instagram,instagram_url").eq("id", 1).maybeSingle(),
        supabase.from("booking_page_settings").select("service_booking_enabled,service_open_hour,service_close_hour,service_duration_options,resource_booking_enabled").eq("id", "main").maybeSingle(),
      ]);

      if (!active) return;

      if (globalResult.data) setGlobal({ ...fallbackGlobal, ...globalResult.data });
      if (contactsResult.data) setContacts({ ...fallbackContacts, ...contactsResult.data });
      if (bookingResult.data) setBooking({ ...fallbackBooking, ...bookingResult.data });

      const firstError = globalResult.error || contactsResult.error || bookingResult.error;
      if (firstError) setMessage(firstError.message);
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, []);

  async function saveGlobal(event: FormEvent) {
    event.preventDefault();
    setSaving("global");
    setMessage("");
    const { error } = await supabase.from("site_global_settings").upsert({ id: 1, ...global });
    setMessage(error ? error.message : "Global settings saved.");
    setSaving(null);
  }

  async function saveContacts(event: FormEvent) {
    event.preventDefault();
    setSaving("contacts");
    setMessage("");
    const { error } = await supabase.from("site_contacts").upsert({ id: 1, ...contacts });
    setMessage(error ? error.message : "Contact settings saved.");
    setSaving(null);
  }

  async function saveBooking(event: FormEvent) {
    event.preventDefault();
    setSaving("booking");
    setMessage("");

    if (booking.service_open_hour >= booking.service_close_hour) {
      setMessage("Opening hour must be earlier than closing hour.");
      setSaving(null);
      return;
    }

    const { error } = await supabase.from("booking_page_settings").upsert({ id: "main", ...booking });
    setMessage(error ? error.message : "Booking foundation settings saved.");
    setSaving(null);
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8b36a]">Schema-aligned settings</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Foundation settings</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68">
              These forms use the locale-neutral fields from the clean database migration. Old UA and PL columns are not used here.
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-black/8 bg-white px-5 py-4 text-sm">{message}</div>
          )}

          {loading ? (
            <div className="mt-6 rounded-[28px] bg-white p-8 text-sm text-[#6f6c65]">Loading settings...</div>
          ) : (
            <div className="mt-6 grid gap-6">
              <SettingsCard title="Business identity" description="Neutral name, logo text, footer and social links.">
                <form onSubmit={saveGlobal} className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Business name" value={global.studio_name} onChange={(value) => setGlobal({ ...global, studio_name: value })} />
                  <TextField label="Logo text" value={global.logo_text} onChange={(value) => setGlobal({ ...global, logo_text: value })} />
                  <TextField label="Notification email" type="email" value={global.notification_email} onChange={(value) => setGlobal({ ...global, notification_email: value })} />
                  <TextField label="Instagram URL" value={global.instagram_url} onChange={(value) => setGlobal({ ...global, instagram_url: value })} />
                  <TextField label="TikTok URL" value={global.tiktok_url} onChange={(value) => setGlobal({ ...global, tiktok_url: value })} />
                  <TextField label="Facebook URL" value={global.facebook_url} onChange={(value) => setGlobal({ ...global, facebook_url: value })} />
                  <TextArea label="Footer text" value={global.footer_text} onChange={(value) => setGlobal({ ...global, footer_text: value })} />
                  <SaveButton busy={saving === "global"} label="Save identity" />
                </form>
              </SettingsCard>

              <SettingsCard title="Contact and business details" description="Public contact information and optional transfer details.">
                <form onSubmit={saveContacts} className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Phone" value={contacts.phone} onChange={(value) => setContacts({ ...contacts, phone: value })} />
                  <TextField label="Email" type="email" value={contacts.email} onChange={(value) => setContacts({ ...contacts, email: value })} />
                  <TextField label="Address" value={contacts.address} onChange={(value) => setContacts({ ...contacts, address: value })} />
                  <TextField label="Opening hours" value={contacts.hours} onChange={(value) => setContacts({ ...contacts, hours: value })} />
                  <TextField label="Map search query" value={contacts.google_maps_query} onChange={(value) => setContacts({ ...contacts, google_maps_query: value })} />
                  <TextField label="Business ID or tax number" value={contacts.nip} onChange={(value) => setContacts({ ...contacts, nip: value })} />
                  <TextField label="Transfer recipient" value={contacts.transfer_recipient} onChange={(value) => setContacts({ ...contacts, transfer_recipient: value })} />
                  <TextField label="Transfer title" value={contacts.transfer_title} onChange={(value) => setContacts({ ...contacts, transfer_title: value })} />
                  <TextField label="Bank account" value={contacts.bank_account} onChange={(value) => setContacts({ ...contacts, bank_account: value })} />
                  <TextField label="Alternative payment ID" value={contacts.blik} onChange={(value) => setContacts({ ...contacts, blik: value })} />
                  <TextField label="Instagram handle" value={contacts.instagram} onChange={(value) => setContacts({ ...contacts, instagram: value })} />
                  <TextField label="Instagram URL" value={contacts.instagram_url} onChange={(value) => setContacts({ ...contacts, instagram_url: value })} />
                  <SaveButton busy={saving === "contacts"} label="Save contacts" />
                </form>
              </SettingsCard>

              <SettingsCard title="Booking foundation" description="Only the universal switches and service hours that exist in the clean schema.">
                <form onSubmit={saveBooking} className="grid gap-4 sm:grid-cols-2">
                  <Toggle label="Service booking enabled" checked={booking.service_booking_enabled} onChange={(value) => setBooking({ ...booking, service_booking_enabled: value })} />
                  <Toggle label="Resource booking enabled" checked={booking.resource_booking_enabled} onChange={(value) => setBooking({ ...booking, resource_booking_enabled: value })} />
                  <NumberField label="Service opening hour" value={booking.service_open_hour} onChange={(value) => setBooking({ ...booking, service_open_hour: value })} />
                  <NumberField label="Service closing hour" value={booking.service_close_hour} onChange={(value) => setBooking({ ...booking, service_close_hour: value })} />
                  <TextField
                    label="Allowed durations in hours"
                    value={booking.service_duration_options.join(", ")}
                    onChange={(value) => setBooking({
                      ...booking,
                      service_duration_options: value.split(",").map((part) => Number(part.trim())).filter((number) => Number.isInteger(number) && number > 0 && number <= 24),
                    })}
                  />
                  <SaveButton busy={saving === "booking"} label="Save booking settings" />
                </form>
              </SettingsCard>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-8">
      <h2 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#6f6c65]">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#77746d]">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf9f5] px-4 py-3 outline-none focus:border-[#9a742e]" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block sm:col-span-2">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#77746d]">{label}</span>
      <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#faf9f5] px-4 py-3 outline-none focus:border-[#9a742e]" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#77746d]">{label}</span>
      <input type="number" min={0} max={24} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-2xl border border-black/10 bg-[#faf9f5] px-4 py-3 outline-none focus:border-[#9a742e]" />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-black/10 bg-[#faf9f5] px-4 py-3">
      <span className="text-sm font-semibold">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5" />
    </label>
  );
}

function SaveButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <div className="flex items-end sm:col-span-2">
      <button type="submit" disabled={busy} className="rounded-full bg-[#17191f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {busy ? "Saving..." : label}
      </button>
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";
import type { AdminMessage } from "@/lib/i18n/admin";
import type {
  BookingSource,
  BookingStatus,
  BusinessRole,
  PaymentStatus,
  PricingModel,
  ServiceKind,
} from "@/lib/modules/contracts";

type WorkspaceRow = {
  business_id: string;
  name: string;
  timezone: string;
  default_locale: string;
  default_currency: string;
  role: BusinessRole;
  is_default: boolean;
};

type ServiceRow = {
  id: string;
  business_id: string;
  title: string;
  kind: ServiceKind;
  pricing_model: PricingModel;
  price_minor: number | null;
  currency: string;
  duration_min_minutes: number | null;
  duration_max_minutes: number | null;
  duration_step_minutes: number | null;
  capacity: number;
  is_active: boolean;
  sort_order: number;
};

type ClientRow = {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  locale: string;
};

type BookingRow = {
  id: string;
  business_id: string;
  reference: string;
  client_id: string;
  service_id: string;
  status: BookingStatus;
  source: BookingSource;
  starts_at: string;
  ends_at: string;
  timezone: string;
  locale: string;
  party_size: number;
  subtotal_minor: number;
  discount_minor: number;
  total_minor: number;
  currency: string;
  payment_status: PaymentStatus;
  customer_notes: string;
  internal_notes: string;
  cancelled_at: string | null;
  cancellation_reason: string;
  created_at: string;
  updated_at: string;
};

type AllocationRow = {
  id: string;
  booking_id: string;
  resource_id: string;
  status: "held" | "confirmed" | "released";
  starts_at: string;
  ends_at: string;
};

type ResourceRow = {
  id: string;
  name: string;
};

type EventRow = {
  id: string;
  booking_id: string;
  event_type: "created" | "updated" | "status_changed" | "cancelled";
  previous_status: string | null;
  new_status: string | null;
  changes: Record<string, unknown>;
  created_at: string;
};

type SlotRow = {
  starts_at: string;
  ends_at: string;
  local_start_time: string;
  local_end_time: string;
  timezone: string;
};

type BookingDraft = {
  service_id: string;
  date: string;
  duration_minutes: string;
  party_size: string;
  slot_starts_at: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  locale: string;
  initial_status: "hold" | "pending" | "confirmed";
  customer_notes: string;
  internal_notes: string;
};

const inputClass = "w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a742e] disabled:cursor-not-allowed disabled:opacity-55";
const buttonClass = "rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-45";
const secondaryButtonClass = "rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45";

const statusMessages: Record<BookingStatus, AdminMessage> = {
  draft: "Draft",
  hold: "Hold",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const eventMessages: Record<EventRow["event_type"], AdminMessage> = {
  created: "Booking created",
  updated: "Booking updated",
  status_changed: "Booking status changed",
  cancelled: "Booking cancelled",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#77736a]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function tomorrowInputDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function emptyDraft(locale = "ru"): BookingDraft {
  return {
    service_id: "",
    date: tomorrowInputDate(),
    duration_minutes: "60",
    party_size: "1",
    slot_starts_at: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    locale,
    initial_status: "confirmed",
    customer_notes: "",
    internal_notes: "",
  };
}

function integerValue(value: string, fallback = 0) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function localParts(iso: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const part = (type: "year" | "month" | "day" | "hour" | "minute") => parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

function formatDateTime(iso: string, timezone: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatMoney(amountMinor: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

function durationMinutes(startsAt: string, endsAt: string) {
  return Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);
}

export default function BookingsManager() {
  const { locale: adminLocale, t } = useAdminI18n();
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [allocations, setAllocations] = useState<AllocationRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [requestedBookingId, setRequestedBookingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft());
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveInFlightRef = useRef(false);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const canOperate = workspace ? workspace.role !== "viewer" : false;
  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId],
  );
  const selectedService = useMemo(
    () => services.find((service) => service.id === draft.service_id) ?? null,
    [services, draft.service_id],
  );
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
  const resourceMap = useMemo(() => new Map(resources.map((resource) => [resource.id, resource])), [resources]);
  const visibleBookings = useMemo(
    () => bookings.filter((booking) => statusFilter === "all" || booking.status === statusFilter),
    [bookings, statusFilter],
  );
  const selectedAllocations = useMemo(
    () => allocations.filter((allocation) => allocation.booking_id === selectedBookingId),
    [allocations, selectedBookingId],
  );
  const selectedEvents = useMemo(
    () => events.filter((event) => event.booking_id === selectedBookingId),
    [events, selectedBookingId],
  );

  const resetMessages = () => {
    setNotice("");
    setError("");
  };

  const loadWorkspaceData = useCallback(async (businessId: string) => {
    const [serviceResult, clientResult, bookingResult, allocationResult, resourceResult, eventResult] = await Promise.all([
      supabase
        .from("services")
        .select("id,business_id,title,kind,pricing_model,price_minor,currency,duration_min_minutes,duration_max_minutes,duration_step_minutes,capacity,is_active,sort_order")
        .eq("business_id", businessId)
        .order("sort_order")
        .order("title"),
      supabase
        .from("clients")
        .select("id,business_id,name,email,phone,locale")
        .eq("business_id", businessId)
        .order("name"),
      supabase
        .from("bookings")
        .select("id,business_id,reference,client_id,service_id,status,source,starts_at,ends_at,timezone,locale,party_size,subtotal_minor,discount_minor,total_minor,currency,payment_status,customer_notes,internal_notes,cancelled_at,cancellation_reason,created_at,updated_at")
        .eq("business_id", businessId)
        .order("starts_at", { ascending: false })
        .limit(250),
      supabase
        .from("booking_allocations")
        .select("id,booking_id,resource_id,status,starts_at,ends_at")
        .eq("business_id", businessId),
      supabase
        .from("resources")
        .select("id,name")
        .eq("business_id", businessId),
      supabase
        .from("booking_events")
        .select("id,booking_id,event_type,previous_status,new_status,changes,created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const firstError = serviceResult.error
      ?? clientResult.error
      ?? bookingResult.error
      ?? allocationResult.error
      ?? resourceResult.error
      ?? eventResult.error;
    if (firstError) throw firstError;

    const nextServices = (serviceResult.data ?? []) as ServiceRow[];
    const nextClients = (clientResult.data ?? []) as ClientRow[];
    const nextBookings = (bookingResult.data ?? []) as BookingRow[];
    setServices(nextServices);
    setClients(nextClients);
    setBookings(nextBookings);
    setAllocations((allocationResult.data ?? []) as AllocationRow[]);
    setResources((resourceResult.data ?? []) as ResourceRow[]);
    setEvents((eventResult.data ?? []) as EventRow[]);
    setSelectedBookingId((current) => current && nextBookings.some((booking) => booking.id === current) ? current : null);
    setDraft((current) => ({
      ...current,
      service_id: current.service_id && nextServices.some((service) => service.id === current.service_id)
        ? current.service_id
        : nextServices.find((service) => service.is_active)?.id ?? "",
    }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: workspaceError } = await supabase.rpc("list_my_businesses");
    if (workspaceError) {
      setError(workspaceError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as WorkspaceRow[];
    const current = rows.find((item) => item.is_default) ?? rows[0] ?? null;
    setWorkspace(current);
    if (!current) {
      setLoading(false);
      return;
    }

    try {
      await loadWorkspaceData(current.business_id);
      setDraft((currentDraft) => ({ ...currentDraft, locale: current.default_locale || "ru" }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("Bookings could not be loaded."));
    }
    setLoading(false);
  }, [loadWorkspaceData, t]);

  useEffect(() => {
    setRequestedBookingId(new URLSearchParams(window.location.search).get("booking"));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedBooking || !selectedService?.duration_min_minutes) return;
    setDraft((current) => ({
      ...current,
      duration_minutes: String(selectedService.duration_min_minutes),
      party_size: String(Math.min(integerValue(current.party_size, 1), selectedService.capacity)),
      slot_starts_at: "",
    }));
    setSlots([]);
  }, [selectedBooking, selectedService]);

  const reload = async () => {
    if (!workspace) return;
    await loadWorkspaceData(workspace.business_id);
  };

  const startNew = () => {
    resetMessages();
    setSelectedBookingId(null);
    const service = services.find((item) => item.is_active) ?? services[0];
    setDraft({
      ...emptyDraft(workspace?.default_locale || "ru"),
      service_id: service?.id ?? "",
      duration_minutes: String(service?.duration_min_minutes ?? 60),
    });
    setSlots([]);
  };

  const selectBooking = useCallback((booking: BookingRow) => {
    setNotice("");
    setError("");
    setSelectedBookingId(booking.id);
    const client = clientMap.get(booking.client_id);
    const local = localParts(booking.starts_at, workspace?.timezone ?? booking.timezone);
    setDraft({
      service_id: booking.service_id,
      date: local.date,
      duration_minutes: String(durationMinutes(booking.starts_at, booking.ends_at)),
      party_size: String(booking.party_size),
      slot_starts_at: booking.starts_at,
      client_name: client?.name ?? "",
      client_email: client?.email ?? "",
      client_phone: client?.phone ?? "",
      locale: booking.locale,
      initial_status: booking.status === "hold" || booking.status === "pending" ? booking.status : "confirmed",
      customer_notes: booking.customer_notes,
      internal_notes: booking.internal_notes,
    });
    setSlots([]);
  }, [clientMap, workspace]);

  useEffect(() => {
    if (!requestedBookingId || !workspace) return;
    const requested = bookings.find((booking) => booking.id === requestedBookingId);
    if (!requested) return;
    selectBooking(requested);
    setRequestedBookingId(null);
  }, [bookings, requestedBookingId, selectBooking, workspace]);

  const checkSlots = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    resetMessages();
    if (!workspace || !draft.service_id || !draft.date) return setError(t("Choose a service and date."));

    const duration = integerValue(draft.duration_minutes);
    const partySize = integerValue(draft.party_size);
    if (duration <= 0 || partySize <= 0) return setError(t("Duration and party size must be positive."));

    setCheckingSlots(true);
    const { data, error: slotError } = await supabase.rpc("get_admin_service_available_slots", {
      p_business_id: workspace.business_id,
      p_service_id: draft.service_id,
      p_date: draft.date,
      p_duration_minutes: duration,
      p_party_size: partySize,
      p_ignore_booking_id: selectedBookingId,
    });
    if (slotError) {
      setError(slotError.message);
      setCheckingSlots(false);
      return;
    }

    const nextSlots = (data ?? []) as SlotRow[];
    setSlots(nextSlots);
    if (!nextSlots.some((slot) => slot.starts_at === draft.slot_starts_at)) {
      setDraft((current) => ({ ...current, slot_starts_at: nextSlots[0]?.starts_at ?? "" }));
    }
    setNotice(nextSlots.length ? t("Available slots: {count}", { count: nextSlots.length }) : t("No available slots for these conditions."));
    setCheckingSlots(false);
  };

  const saveBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saveInFlightRef.current) return;

    resetMessages();
    if (!workspace || !canOperate) return setError(t("This role cannot manage bookings."));
    if (!draft.service_id || !draft.slot_starts_at) return setError(t("Choose and select an available slot."));
    if (!draft.client_name.trim()) return setError(t("Enter the client name."));

    const duration = integerValue(draft.duration_minutes);
    const partySize = integerValue(draft.party_size);
    if (duration <= 0 || partySize <= 0) return setError(t("Duration and party size must be positive."));

    const wasEditing = Boolean(selectedBookingId);
    saveInFlightRef.current = true;
    setSaving(true);

    try {
      const common = {
        p_service_id: draft.service_id,
        p_starts_at: draft.slot_starts_at,
        p_duration_minutes: duration,
        p_party_size: partySize,
        p_client_name: draft.client_name.trim(),
        p_client_email: draft.client_email.trim() || null,
        p_client_phone: draft.client_phone.trim() || null,
        p_locale: draft.locale.trim() || workspace.default_locale,
        p_customer_notes: draft.customer_notes.trim(),
        p_internal_notes: draft.internal_notes.trim(),
      };

      const result = selectedBookingId
        ? await supabase.rpc("update_admin_booking", { p_booking_id: selectedBookingId, ...common })
        : await supabase.rpc("create_admin_booking", {
            p_business_id: workspace.business_id,
            ...common,
            p_status: draft.initial_status,
          });

      if (result.error) {
        const message = result.error.message.includes("booking_slot")
          ? t("That slot was just taken or is no longer available.")
          : result.error.message;
        setError(message);
        return;
      }

      const savedId = String(result.data);
      await reload();
      setSelectedBookingId(savedId);
      setNotice(wasEditing ? t("Booking updated.") : t("Booking created."));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("That slot was just taken or is no longer available."));
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  };

  const changeStatus = async (status: BookingStatus) => {
    if (!selectedBooking || !canOperate) return;
    resetMessages();
    let reason = "";
    if (status === "cancelled") {
      const promptedReason = window.prompt(t("Cancellation reason"), selectedBooking.cancellation_reason);
      if (promptedReason === null) return;
      reason = promptedReason;
      if (!window.confirm(t("Cancel this booking?"))) return;
    }

    setSaving(true);
    const action = status === "cancelled"
      ? await supabase.rpc("cancel_admin_booking", { p_booking_id: selectedBooking.id, p_reason: reason })
      : await supabase.rpc("set_admin_booking_status", { p_booking_id: selectedBooking.id, p_status: status, p_reason: reason });

    if (action.error) {
      setError(action.error.message.includes("invalid_booking_status_transition")
        ? t("This status transition is not allowed.")
        : action.error.message);
      setSaving(false);
      return;
    }

    await reload();
    setNotice(status === "cancelled" ? t("Booking cancelled.") : t("Booking status updated."));
    setSaving(false);
  };

  const activeBooking = selectedBooking && ["hold", "pending", "confirmed"].includes(selectedBooking.status);
  const nextActions = selectedBooking?.status === "hold"
    ? (["pending", "confirmed", "cancelled"] as BookingStatus[])
    : selectedBooking?.status === "pending"
      ? (["confirmed", "cancelled"] as BookingStatus[])
      : selectedBooking?.status === "confirmed"
        ? (["completed", "no_show", "cancelled"] as BookingStatus[])
        : [];

  if (loading) {
    return <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-7 text-sm text-[#77736a]">{t("Loading bookings…")}</div>;
  }

  if (!workspace) {
    return <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-7 text-sm text-[#77736a]">{t("No workspace is assigned.")}</div>;
  }

  return (
    <div className="mt-8">
      {(notice || error) && (
        <div className={`mb-5 rounded-[22px] border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || notice}
        </div>
      )}

      <div className="rounded-[28px] border border-black/8 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Current workspace")}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{workspace.name}</h2>
            <p className="mt-1 text-sm text-[#77736a]">{t("Role")}: {workspace.role} · {canOperate ? t("Booking operations allowed") : t("Read-only booking access")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as BookingStatus | "all")}>
              <option value="all">{t("All statuses")}</option>
              {(Object.keys(statusMessages) as BookingStatus[]).map((status) => <option key={status} value={status}>{t(statusMessages[status])}</option>)}
            </select>
            <button type="button" className={secondaryButtonClass} onClick={() => void load()}>{t("Refresh")}</button>
            <button type="button" className={buttonClass} onClick={startNew} disabled={!canOperate}>{t("New booking")}</button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Bookings")}</p>
              <p className="mt-1 text-sm text-[#77736a]">{t("{count} bookings", { count: visibleBookings.length })}</p>
            </div>
          </div>
          <div className="mt-5 grid max-h-[820px] gap-3 overflow-y-auto pr-1">
            {visibleBookings.length === 0 && <div className="rounded-2xl bg-white/80 p-5 text-sm text-[#77736a]">{t("No bookings yet.")}</div>}
            {visibleBookings.map((booking) => {
              const client = clientMap.get(booking.client_id);
              const service = serviceMap.get(booking.service_id);
              const active = booking.id === selectedBookingId;
              return (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => selectBooking(booking)}
                  className={`rounded-[22px] border p-4 text-left transition ${active ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/8 bg-white hover:-translate-y-0.5"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${active ? "text-[#d8b36a]" : "text-[#9a742e]"}`}>{booking.reference}</p>
                      <p className="mt-2 text-lg font-semibold">{client?.name ?? t("Unknown client")}</p>
                      <p className={`mt-1 text-sm ${active ? "text-white/65" : "text-[#77736a]"}`}>{service?.title ?? t("Unknown service")}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${active ? "bg-white/10" : "bg-[#eeebe3]"}`}>{t(statusMessages[booking.status])}</span>
                  </div>
                  <p className={`mt-4 text-sm ${active ? "text-white/78" : "text-[#55524c]"}`}>{formatDateTime(booking.starts_at, workspace.timezone, adminLocale)}</p>
                  <div className={`mt-3 flex items-center justify-between text-xs ${active ? "text-white/60" : "text-[#77736a]"}`}>
                    <span>{t("{count} people", { count: booking.party_size })}</span>
                    <span>{formatMoney(booking.total_minor, booking.currency, adminLocale)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
          <div className="flex flex-col gap-4 border-b border-black/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{selectedBooking ? t("Booking details") : t("New booking")}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedBooking?.reference ?? t("Reserve a calculated slot")}</h2>
              {selectedBooking && <p className="mt-2 text-sm text-[#77736a]">{t("Status")}: {t(statusMessages[selectedBooking.status])}</p>}
            </div>
            {selectedBooking && (
              <div className="flex flex-wrap gap-2">
                {nextActions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={status === "cancelled" ? "rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700" : secondaryButtonClass}
                    onClick={() => void changeStatus(status)}
                    disabled={saving}
                  >
                    {status === "cancelled" ? t("Cancel booking") : t(statusMessages[status])}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="mt-6" onSubmit={saveBooking}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("Service")}>
                <select className={inputClass} value={draft.service_id} onChange={(event) => setDraft((current) => ({ ...current, service_id: event.target.value, slot_starts_at: "" }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)}>
                  <option value="">{t("Choose service")}</option>
                  {services.filter((service) => service.is_active || service.id === selectedBooking?.service_id).map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
                </select>
              </Field>
              <Field label={t("Date")}>
                <input className={inputClass} type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value, slot_starts_at: "" }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} />
              </Field>
              <Field label={t("Duration, min")}>
                <input className={inputClass} type="number" min="1" value={draft.duration_minutes} onChange={(event) => setDraft((current) => ({ ...current, duration_minutes: event.target.value, slot_starts_at: "" }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} />
              </Field>
              <Field label={t("Party size")}>
                <input className={inputClass} type="number" min="1" max={selectedService?.capacity ?? undefined} value={draft.party_size} onChange={(event) => setDraft((current) => ({ ...current, party_size: event.target.value, slot_starts_at: "" }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} />
              </Field>
            </div>

            <div className="mt-4 rounded-[24px] border border-black/8 bg-[#eeebe3] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{t("Available start")}</p>
                  <p className="mt-1 text-sm text-[#77736a]">{t("The slot is checked again inside the database when you save.")}</p>
                </div>
                <button type="button" className={secondaryButtonClass} onClick={() => void checkSlots()} disabled={checkingSlots || !canOperate || Boolean(selectedBooking && !activeBooking)}>{checkingSlots ? t("Checking…") : t("Check available slots")}</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.starts_at}
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, slot_starts_at: slot.starts_at }))}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${draft.slot_starts_at === slot.starts_at ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/10 bg-white"}`}
                  >
                    {slot.local_start_time.slice(0, 5)}–{slot.local_end_time.slice(0, 5)}
                  </button>
                ))}
                {draft.slot_starts_at && slots.length === 0 && (
                  <span className="rounded-full bg-[#17191f] px-4 py-2 text-sm font-semibold text-white">{localParts(draft.slot_starts_at, workspace.timezone).time}</span>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label={t("Client name")}><input className={inputClass} value={draft.client_name} onChange={(event) => setDraft((current) => ({ ...current, client_name: event.target.value }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} /></Field>
              <Field label={t("Email")}><input className={inputClass} type="email" value={draft.client_email} onChange={(event) => setDraft((current) => ({ ...current, client_email: event.target.value }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} /></Field>
              <Field label={t("Phone")}><input className={inputClass} value={draft.client_phone} onChange={(event) => setDraft((current) => ({ ...current, client_phone: event.target.value }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} /></Field>
              <Field label={t("Client language")}><input className={inputClass} value={draft.locale} onChange={(event) => setDraft((current) => ({ ...current, locale: event.target.value }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} /></Field>
              {!selectedBooking && (
                <Field label={t("Initial status")}>
                  <select className={inputClass} value={draft.initial_status} onChange={(event) => setDraft((current) => ({ ...current, initial_status: event.target.value as BookingDraft["initial_status"] }))} disabled={!canOperate}>
                    <option value="hold">{t("Hold")}</option>
                    <option value="pending">{t("Pending")}</option>
                    <option value="confirmed">{t("Confirmed")}</option>
                  </select>
                </Field>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t("Client notes")}><textarea className={`${inputClass} min-h-28`} value={draft.customer_notes} onChange={(event) => setDraft((current) => ({ ...current, customer_notes: event.target.value }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} /></Field>
              <Field label={t("Internal notes")}><textarea className={`${inputClass} min-h-28`} value={draft.internal_notes} onChange={(event) => setDraft((current) => ({ ...current, internal_notes: event.target.value }))} disabled={!canOperate || Boolean(selectedBooking && !activeBooking)} /></Field>
            </div>

            {selectedBooking && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-black/8 bg-[#fffdfa] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{t("Reserved resources")}</p>
                  <div className="mt-3 grid gap-2">
                    {selectedAllocations.map((allocation) => <div key={allocation.id} className="flex items-center justify-between rounded-xl bg-[#eeebe3] px-3 py-2 text-sm"><span>{resourceMap.get(allocation.resource_id)?.name ?? t("Unknown resource")}</span><span className="text-xs text-[#77736a]">{allocation.status}</span></div>)}
                    {selectedAllocations.length === 0 && <p className="text-sm text-[#77736a]">{t("No resource allocations.")}</p>}
                  </div>
                </div>
                <div className="rounded-[22px] border border-black/8 bg-[#fffdfa] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{t("Activity")}</p>
                  <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto">
                    {selectedEvents.map((event) => <div key={event.id} className="rounded-xl bg-[#eeebe3] px-3 py-2"><p className="text-sm font-semibold">{t(eventMessages[event.event_type])}</p><p className="mt-1 text-xs text-[#77736a]">{formatDateTime(event.created_at, workspace.timezone, adminLocale)}</p></div>)}
                    {selectedEvents.length === 0 && <p className="text-sm text-[#77736a]">{t("No activity yet.")}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-5">
              <div className="text-sm text-[#77736a]">
                {selectedService && selectedBooking ? formatMoney(selectedBooking.total_minor, selectedBooking.currency, adminLocale) : selectedService?.pricing_model === "fixed" && selectedService.price_minor !== null ? formatMoney(selectedService.price_minor, selectedService.currency, adminLocale) : t("Price is calculated when saved")}
              </div>
              <button type="submit" className={buttonClass} disabled={saving || !canOperate || Boolean(selectedBooking && !activeBooking)}>{saving ? t("Saving…") : selectedBooking ? t("Save booking") : t("Create booking")}</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

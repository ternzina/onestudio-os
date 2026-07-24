"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";
import type { AdminMessage, AdminMessageValues } from "@/lib/i18n/admin";
import type { BusinessRole, ResourceKind, ServiceKind } from "@/lib/modules/contracts";

type AvailabilityTab = "settings" | "weekly" | "exceptions" | "preview";
type ExceptionKind = "available" | "blocked";

type WorkspaceRow = {
  business_id: string;
  name: string;
  timezone: string;
  default_currency: string;
  role: BusinessRole;
  is_default: boolean;
};

type SettingsRow = {
  business_id: string;
  minimum_notice_minutes: number;
  booking_horizon_days: number;
  slot_interval_minutes: number;
};

type ResourceRow = {
  id: string;
  business_id: string;
  name: string;
  kind: ResourceKind;
  timezone: string | null;
  is_bookable: boolean;
  is_active: boolean;
  sort_order: number;
};

type ServiceRow = {
  id: string;
  business_id: string;
  title: string;
  kind: ServiceKind;
  duration_min_minutes: number | null;
  duration_max_minutes: number | null;
  duration_step_minutes: number | null;
  capacity: number;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

type RuleRow = {
  id: string;
  business_id: string;
  resource_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  effective_from: string | null;
  effective_until: string | null;
  is_active: boolean;
};

type ExceptionRow = {
  id: string;
  business_id: string;
  resource_id: string;
  kind: ExceptionKind;
  starts_at: string;
  ends_at: string;
  reason: string;
};

type SlotRow = {
  starts_at: string;
  ends_at: string;
  local_start_time: string;
  local_end_time: string;
  timezone: string;
};

type TimeInterval = {
  start_time: string;
  end_time: string;
};

type WeeklyDraft = Record<number, TimeInterval[]>;

type SettingsDraft = {
  minimum_notice_minutes: string;
  booking_horizon_days: string;
  slot_interval_minutes: string;
};

type ExceptionDraft = {
  kind: ExceptionKind;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
};

const inputClass = "w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a742e] disabled:cursor-not-allowed disabled:opacity-55";
const buttonClass = "rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-45";
const secondaryButtonClass = "rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45";

const resourceKindMessages: Record<ResourceKind, AdminMessage> = {
  staff: "Staff",
  space: "Space",
  equipment: "Equipment",
  seat: "Seat",
  asset: "Asset",
  other: "Other",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#77736a]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function emptyWeeklyDraft(): WeeklyDraft {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
}

function tomorrowInputDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function positiveInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function trimTime(value: string) {
  return value.slice(0, 5);
}

function addMinutesToTime(value: string, minutes: number) {
  const [hours, mins] = value.split(":").map((part) => Number.parseInt(part, 10));
  const total = Math.min(23 * 60 + 59, Math.max(0, hours * 60 + mins + minutes));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function exceptionDraft(): ExceptionDraft {
  return {
    kind: "blocked",
    date: tomorrowInputDate(),
    start_time: "09:00",
    end_time: "18:00",
    reason: "",
  };
}

export default function AvailabilityManager() {
  const { locale, t } = useAdminI18n();
  const [tab, setTab] = useState<AvailabilityTab>("settings");
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [settingsDraft, setSettingsDraft] = useState<SettingsDraft>({
    minimum_notice_minutes: "120",
    booking_horizon_days: "90",
    slot_interval_minutes: "30",
  });
  const [weeklyDraft, setWeeklyDraft] = useState<WeeklyDraft>(emptyWeeklyDraft());
  const [exceptionForm, setExceptionForm] = useState<ExceptionDraft>(exceptionDraft());
  const [previewServiceId, setPreviewServiceId] = useState("");
  const [previewDate, setPreviewDate] = useState(tomorrowInputDate());
  const [previewDuration, setPreviewDuration] = useState("60");
  const [previewPartySize, setPreviewPartySize] = useState("1");
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const canConfigure = workspace
    ? workspace.role === "owner" || workspace.role === "admin" || workspace.role === "manager"
    : false;

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedResourceId) ?? null,
    [resources, selectedResourceId],
  );

  const selectedResourceExceptions = useMemo(
    () => exceptions.filter((exception) => exception.resource_id === selectedResourceId),
    [exceptions, selectedResourceId],
  );

  const dayNames = useMemo(
    () => [
      t("Sunday"),
      t("Monday"),
      t("Tuesday"),
      t("Wednesday"),
      t("Thursday"),
      t("Friday"),
      t("Saturday"),
    ],
    [t],
  );

  const loadAvailability = useCallback(async (businessId: string) => {
    const [settingsResult, resourceResult, serviceResult, ruleResult, exceptionResult] = await Promise.all([
      supabase
        .from("business_availability_settings")
        .select("business_id,minimum_notice_minutes,booking_horizon_days,slot_interval_minutes")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("resources")
        .select("id,business_id,name,kind,timezone,is_bookable,is_active,sort_order")
        .eq("business_id", businessId)
        .order("sort_order")
        .order("name"),
      supabase
        .from("services")
        .select("id,business_id,title,kind,duration_min_minutes,duration_max_minutes,duration_step_minutes,capacity,is_public,is_active,sort_order")
        .eq("business_id", businessId)
        .order("sort_order")
        .order("title"),
      supabase
        .from("availability_rules")
        .select("id,business_id,resource_id,day_of_week,start_time,end_time,effective_from,effective_until,is_active")
        .eq("business_id", businessId)
        .order("day_of_week")
        .order("start_time"),
      supabase
        .from("availability_exceptions")
        .select("id,business_id,resource_id,kind,starts_at,ends_at,reason")
        .eq("business_id", businessId)
        .order("starts_at"),
    ]);

    const firstError = settingsResult.error
      ?? resourceResult.error
      ?? serviceResult.error
      ?? ruleResult.error
      ?? exceptionResult.error;
    if (firstError) throw firstError;

    const nextSettings = settingsResult.data as SettingsRow | null;
    const nextResources = (resourceResult.data ?? []) as ResourceRow[];
    const nextServices = (serviceResult.data ?? []) as ServiceRow[];
    const nextRules = (ruleResult.data ?? []) as RuleRow[];
    const nextExceptions = (exceptionResult.data ?? []) as ExceptionRow[];

    setSettings(nextSettings);
    setResources(nextResources);
    setServices(nextServices);
    setRules(nextRules);
    setExceptions(nextExceptions);
    setSelectedResourceId((current) => current && nextResources.some((resource) => resource.id === current)
      ? current
      : nextResources[0]?.id ?? "");
    setPreviewServiceId((current) => current && nextServices.some((service) => service.id === current)
      ? current
      : nextServices.find((service) => service.is_active)?.id ?? nextServices[0]?.id ?? "");

    if (nextSettings) {
      setSettingsDraft({
        minimum_notice_minutes: String(nextSettings.minimum_notice_minutes),
        booking_horizon_days: String(nextSettings.booking_horizon_days),
        slot_interval_minutes: String(nextSettings.slot_interval_minutes),
      });
    }
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
      await loadAvailability(current.business_id);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("Availability could not be loaded."));
    }

    setLoading(false);
  }, [loadAvailability, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const next = emptyWeeklyDraft();
    rules
      .filter((rule) => rule.resource_id === selectedResourceId && rule.is_active && rule.effective_from === null && rule.effective_until === null)
      .forEach((rule) => {
        next[rule.day_of_week] = [
          ...next[rule.day_of_week],
          { start_time: trimTime(rule.start_time), end_time: trimTime(rule.end_time) },
        ];
      });
    setWeeklyDraft(next);
  }, [rules, selectedResourceId]);

  useEffect(() => {
    const service = services.find((item) => item.id === previewServiceId);
    if (service?.duration_min_minutes) {
      setPreviewDuration(String(service.duration_min_minutes));
    }
    setSlots([]);
  }, [previewServiceId, services]);

  const resetMessages = () => {
    setNotice("");
    setError("");
  };

  const reloadAvailability = async () => {
    if (!workspace) return;
    await loadAvailability(workspace.business_id);
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    if (!workspace || !canConfigure) return setError(t("This role cannot configure availability."));

    const minimumNotice = nonNegativeInteger(settingsDraft.minimum_notice_minutes, -1);
    const horizon = positiveInteger(settingsDraft.booking_horizon_days, -1);
    const slotInterval = positiveInteger(settingsDraft.slot_interval_minutes, -1);

    if (minimumNotice < 0 || horizon < 1 || horizon > 730 || slotInterval < 5 || slotInterval > 1440) {
      return setError(t("Enter valid notice, horizon and slot interval values."));
    }

    setSaving(true);
    const { error: saveError } = await supabase
      .from("business_availability_settings")
      .update({
        minimum_notice_minutes: minimumNotice,
        booking_horizon_days: horizon,
        slot_interval_minutes: slotInterval,
      })
      .eq("business_id", workspace.business_id);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    await reloadAvailability();
    setNotice(t("Availability settings saved."));
    setSaving(false);
  };

  const setDayEnabled = (day: number, enabled: boolean) => {
    setWeeklyDraft((current) => ({
      ...current,
      [day]: enabled ? (current[day].length ? current[day] : [{ start_time: "09:00", end_time: "18:00" }]) : [],
    }));
  };

  const updateInterval = (day: number, index: number, field: keyof TimeInterval, value: string) => {
    setWeeklyDraft((current) => ({
      ...current,
      [day]: current[day].map((interval, intervalIndex) => intervalIndex === index
        ? { ...interval, [field]: value }
        : interval),
    }));
  };

  const addInterval = (day: number) => {
    setWeeklyDraft((current) => {
      const previous = current[day][current[day].length - 1];
      const start = previous?.end_time ?? "13:00";
      const end = addMinutesToTime(start, 60);
      return {
        ...current,
        [day]: [...current[day], { start_time: start, end_time: end }],
      };
    });
  };

  const removeInterval = (day: number, index: number) => {
    setWeeklyDraft((current) => ({
      ...current,
      [day]: current[day].filter((_, intervalIndex) => intervalIndex !== index),
    }));
  };

  const saveWeekly = async () => {
    resetMessages();
    if (!selectedResource || !canConfigure) return setError(t("Choose a resource you can configure."));

    const payload = Object.entries(weeklyDraft).flatMap(([day, intervals]) => intervals.map((interval) => ({
      day_of_week: Number(day),
      start_time: interval.start_time,
      end_time: interval.end_time,
    })));

    if (payload.some((interval) => !interval.start_time || !interval.end_time || interval.start_time >= interval.end_time)) {
      return setError(t("Every working interval must have a valid start and end time."));
    }

    setSaving(true);
    const { error: saveError } = await supabase.rpc("replace_resource_weekly_availability", {
      p_resource_id: selectedResource.id,
      p_rules: payload,
    });

    if (saveError) {
      setError(saveError.message.includes("availability_rules_overlap")
        ? t("Working intervals cannot overlap.")
        : saveError.message);
      setSaving(false);
      return;
    }

    await reloadAvailability();
    setNotice(t("Weekly availability saved."));
    setSaving(false);
  };

  const saveException = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    if (!selectedResource || !canConfigure) return setError(t("Choose a resource you can configure."));
    if (!exceptionForm.date || !exceptionForm.start_time || !exceptionForm.end_time || exceptionForm.start_time >= exceptionForm.end_time) {
      return setError(t("Enter a valid exception date and time window."));
    }

    setSaving(true);
    const { error: saveError } = await supabase.rpc("create_resource_availability_exception", {
      p_resource_id: selectedResource.id,
      p_kind: exceptionForm.kind,
      p_local_date: exceptionForm.date,
      p_start_time: exceptionForm.start_time,
      p_end_time: exceptionForm.end_time,
      p_reason: exceptionForm.reason.trim(),
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    await reloadAvailability();
    setExceptionForm(exceptionDraft());
    setNotice(t("Date exception created."));
    setSaving(false);
  };

  const deleteException = async (exception: ExceptionRow) => {
    resetMessages();
    if (!canConfigure) return setError(t("This role cannot configure availability."));
    if (!window.confirm(t("Delete this date exception?"))) return;

    setSaving(true);
    const { error: deleteError } = await supabase
      .from("availability_exceptions")
      .delete()
      .eq("id", exception.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    await reloadAvailability();
    setNotice(t("Date exception deleted."));
    setSaving(false);
  };

  const previewSlots = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setSlots([]);
    if (!workspace || !previewServiceId || !previewDate) return setError(t("Choose a service and date."));

    const duration = positiveInteger(previewDuration, -1);
    const partySize = positiveInteger(previewPartySize, -1);
    if (duration < 1 || partySize < 1) return setError(t("Duration and party size must be positive."));

    setPreviewing(true);
    const { data, error: previewError } = await supabase.rpc("get_service_available_slots", {
      p_business_id: workspace.business_id,
      p_service_id: previewServiceId,
      p_date: previewDate,
      p_duration_minutes: duration,
      p_party_size: partySize,
    });

    if (previewError) {
      setError(previewError.message);
      setPreviewing(false);
      return;
    }

    const nextSlots = (data ?? []) as SlotRow[];
    setSlots(nextSlots);
    setNotice(nextSlots.length
      ? t("Available slots: {count}", { count: nextSlots.length })
      : t("No available slots for these conditions."));
    setPreviewing(false);
  };

  const formatExceptionWindow = (exception: ExceptionRow) => {
    const timezone = selectedResource?.timezone || workspace?.timezone || "UTC";
    try {
      const formatter = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${formatter.format(new Date(exception.starts_at))} – ${formatter.format(new Date(exception.ends_at))}`;
    } catch {
      return `${exception.starts_at} – ${exception.ends_at}`;
    }
  };

  if (loading) {
    return <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8 text-sm text-[#77736a]">{t("Loading availability…")}</div>;
  }

  if (!workspace) {
    return <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8 text-sm text-[#77736a]">{t("No active workspace is assigned to this account.")}</div>;
  }

  const tabs: { key: AvailabilityTab; label: string }[] = [
    { key: "settings", label: t("Booking window") },
    { key: "weekly", label: t("Weekly hours") },
    { key: "exceptions", label: t("Date exceptions") },
    { key: "preview", label: t("Slot preview") },
  ];

  return (
    <div className="mt-8 space-y-5">
      <section className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Current workspace")}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{workspace.name}</h2>
            <p className="mt-1 text-sm text-[#77736a]">
              {t("Role: {role} · {access}", {
                role: workspace.role,
                access: canConfigure ? t("Availability configuration allowed") : t("Read-only availability access"),
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  resetMessages();
                  setTab(item.key);
                }}
                className={`rounded-full border px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] ${tab === item.key ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/10 bg-white text-[#77736a]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {(notice || error) && (
        <div className={`rounded-[22px] border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || notice}
        </div>
      )}

      {tab === "settings" && (
        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-black/8 bg-[#eeebe3] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Booking window")}</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{t("How far and how soon.")}</h3>
            <p className="mt-4 text-sm leading-7 text-[#6f6c65]">
              {t("These workspace rules apply before resource hours are checked. They stop last-minute requests and dates too far into the future.")}
            </p>
            <div className="mt-6 rounded-[22px] bg-white/70 p-4 text-sm leading-6 text-[#77736a]">
              {t("Slot interval controls the cadence of proposed start times. Service duration and buffers still decide whether each proposal fits.")}
            </div>
          </div>

          <form onSubmit={saveSettings} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-8">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t("Minimum notice, min")}>
                <input
                  type="number"
                  min="0"
                  max="525600"
                  value={settingsDraft.minimum_notice_minutes}
                  onChange={(event) => setSettingsDraft((current) => ({ ...current, minimum_notice_minutes: event.target.value }))}
                  disabled={!canConfigure}
                  className={inputClass}
                />
              </Field>
              <Field label={t("Booking horizon, days")}>
                <input
                  type="number"
                  min="1"
                  max="730"
                  value={settingsDraft.booking_horizon_days}
                  onChange={(event) => setSettingsDraft((current) => ({ ...current, booking_horizon_days: event.target.value }))}
                  disabled={!canConfigure}
                  className={inputClass}
                />
              </Field>
              <Field label={t("Slot interval, min")}>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settingsDraft.slot_interval_minutes}
                  onChange={(event) => setSettingsDraft((current) => ({ ...current, slot_interval_minutes: event.target.value }))}
                  disabled={!canConfigure}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="mt-7 flex justify-end">
              <button type="submit" disabled={!canConfigure || saving || !settings} className={buttonClass}>
                {saving ? t("Saving…") : t("Save booking window")}
              </button>
            </div>
          </form>
        </section>
      )}

      {tab === "weekly" && (
        <section className="grid gap-5 xl:grid-cols-[0.38fr_0.62fr]">
          <ResourcePicker
            resources={resources}
            selectedResourceId={selectedResourceId}
            onSelect={setSelectedResourceId}
            title={t("Bookable resources")}
            emptyLabel={t("Create a bookable resource in Catalog first.")}
            t={t}
          />

          <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Weekly hours")}</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedResource?.name ?? t("Choose a resource")}</h3>
                <p className="mt-2 text-sm text-[#77736a]">{t("Add two intervals to create a lunch break or another gap.")}</p>
              </div>
              <button type="button" onClick={saveWeekly} disabled={!canConfigure || saving || !selectedResource} className={buttonClass}>
                {saving ? t("Saving…") : t("Save weekly hours")}
              </button>
            </div>

            <div className="mt-7 space-y-3">
              {dayNames.map((dayName, day) => {
                const intervals = weeklyDraft[day];
                const enabled = intervals.length > 0;
                return (
                  <div key={day} className="rounded-[22px] border border-black/8 bg-[#fffdfa] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(event) => setDayEnabled(day, event.target.checked)}
                          disabled={!canConfigure}
                          className="h-4 w-4 accent-[#17191f]"
                        />
                        {dayName}
                      </label>
                      {enabled && canConfigure && (
                        <button type="button" onClick={() => addInterval(day)} className={secondaryButtonClass}>{t("+ Add interval")}</button>
                      )}
                    </div>

                    {enabled ? (
                      <div className="mt-4 space-y-3">
                        {intervals.map((interval, index) => (
                          <div key={`${day}-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                            <Field label={t("Starts")}>
                              <input
                                type="time"
                                value={interval.start_time}
                                onChange={(event) => updateInterval(day, index, "start_time", event.target.value)}
                                disabled={!canConfigure}
                                className={inputClass}
                              />
                            </Field>
                            <Field label={t("Ends")}>
                              <input
                                type="time"
                                value={interval.end_time}
                                onChange={(event) => updateInterval(day, index, "end_time", event.target.value)}
                                disabled={!canConfigure}
                                className={inputClass}
                              />
                            </Field>
                            {canConfigure && (
                              <button type="button" onClick={() => removeInterval(day, index)} className={secondaryButtonClass}>{t("Remove")}</button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#9a968d]">{t("Closed")}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {tab === "exceptions" && (
        <section className="grid gap-5 xl:grid-cols-[0.34fr_0.66fr]">
          <ResourcePicker
            resources={resources}
            selectedResourceId={selectedResourceId}
            onSelect={setSelectedResourceId}
            title={t("Resource exceptions")}
            emptyLabel={t("Create a bookable resource in Catalog first.")}
            t={t}
          />

          <div className="space-y-5">
            <form onSubmit={saveException} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("New date exception")}</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedResource?.name ?? t("Choose a resource")}</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label={t("Exception kind")}>
                  <select
                    value={exceptionForm.kind}
                    onChange={(event) => setExceptionForm((current) => ({ ...current, kind: event.target.value as ExceptionKind }))}
                    disabled={!canConfigure}
                    className={inputClass}
                  >
                    <option value="blocked">{t("Blocked")}</option>
                    <option value="available">{t("Extra availability")}</option>
                  </select>
                </Field>
                <Field label={t("Date")}>
                  <input type="date" value={exceptionForm.date} onChange={(event) => setExceptionForm((current) => ({ ...current, date: event.target.value }))} disabled={!canConfigure} className={inputClass} />
                </Field>
                <Field label={t("Starts")}>
                  <input type="time" value={exceptionForm.start_time} onChange={(event) => setExceptionForm((current) => ({ ...current, start_time: event.target.value }))} disabled={!canConfigure} className={inputClass} />
                </Field>
                <Field label={t("Ends")}>
                  <input type="time" value={exceptionForm.end_time} onChange={(event) => setExceptionForm((current) => ({ ...current, end_time: event.target.value }))} disabled={!canConfigure} className={inputClass} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label={t("Reason or note")}>
                  <input value={exceptionForm.reason} onChange={(event) => setExceptionForm((current) => ({ ...current, reason: event.target.value }))} disabled={!canConfigure} className={inputClass} placeholder={t("Holiday, maintenance, extra opening…")} />
                </Field>
              </div>
              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={!canConfigure || saving || !selectedResource} className={buttonClass}>{saving ? t("Saving…") : t("Create exception")}</button>
              </div>
            </form>

            <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Date exceptions")}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{t("One-off changes")}</h3>
                </div>
                <span className="rounded-full bg-[#eeebe3] px-3 py-1.5 text-xs font-semibold text-[#77736a]">{selectedResourceExceptions.length}</span>
              </div>
              <div className="mt-5 space-y-3">
                {selectedResourceExceptions.length ? selectedResourceExceptions.map((exception) => (
                  <article key={exception.id} className="flex flex-col gap-4 rounded-[22px] border border-black/8 bg-[#fffdfa] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${exception.kind === "blocked" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
                          {exception.kind === "blocked" ? t("Blocked") : t("Extra availability")}
                        </span>
                        <span className="text-sm font-semibold">{formatExceptionWindow(exception)}</span>
                      </div>
                      {exception.reason && <p className="mt-2 text-sm text-[#77736a]">{exception.reason}</p>}
                    </div>
                    {canConfigure && (
                      <button type="button" onClick={() => void deleteException(exception)} disabled={saving} className={secondaryButtonClass}>{t("Delete")}</button>
                    )}
                  </article>
                )) : (
                  <div className="rounded-[22px] bg-[#eeebe3] p-5 text-sm text-[#77736a]">{t("No date exceptions for this resource.")}</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "preview" && (
        <section className="grid gap-5 lg:grid-cols-[0.42fr_0.58fr]">
          <form onSubmit={previewSlots} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Slot preview")}</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{t("Ask the scheduling core.")}</h3>
            <p className="mt-3 text-sm leading-6 text-[#77736a]">{t("This uses the same public-safe calculation that the future booking page will call.")}</p>
            <div className="mt-6 space-y-4">
              <Field label={t("Service")}>
                <select value={previewServiceId} onChange={(event) => setPreviewServiceId(event.target.value)} className={inputClass}>
                  <option value="">{t("Choose service")}</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.title}{service.is_active ? "" : ` · ${t("Inactive")}`}</option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("Date")}>
                  <input type="date" value={previewDate} onChange={(event) => setPreviewDate(event.target.value)} className={inputClass} />
                </Field>
                <Field label={t("Duration, min")}>
                  <input type="number" min="1" value={previewDuration} onChange={(event) => setPreviewDuration(event.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label={t("Party size")}>
                <input type="number" min="1" value={previewPartySize} onChange={(event) => setPreviewPartySize(event.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={previewing || !previewServiceId} className={buttonClass}>{previewing ? t("Checking…") : t("Check available slots")}</button>
            </div>
          </form>

          <div className="rounded-[28px] border border-black/8 bg-[#eeebe3] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Calculated result")}</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{t("Available starts")}</h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#77736a]">{slots.length}</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {slots.map((slot) => (
                <div key={slot.starts_at} className="rounded-[18px] border border-black/8 bg-white px-4 py-4 text-center shadow-[0_10px_30px_rgba(20,20,20,0.04)]">
                  <p className="text-lg font-semibold">{trimTime(slot.local_start_time)}</p>
                  <p className="mt-1 text-xs text-[#8a867d]">{t("until {time}", { time: trimTime(slot.local_end_time) })}</p>
                </div>
              ))}
            </div>
            {!slots.length && (
              <div className="mt-6 rounded-[22px] bg-white/70 p-5 text-sm leading-6 text-[#77736a]">{t("Choose conditions and run a preview. Empty results can mean closed hours, an exception, insufficient notice, horizon limits, buffers or a resource conflict.")}</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function ResourcePicker({
  resources,
  selectedResourceId,
  onSelect,
  title,
  emptyLabel,
  t,
}: {
  resources: ResourceRow[];
  selectedResourceId: string;
  onSelect: (id: string) => void;
  title: string;
  emptyLabel: string;
  t: (message: AdminMessage, values?: AdminMessageValues) => string;
}) {
  return (
    <aside className="rounded-[28px] border border-black/8 bg-[#eeebe3] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{title}</p>
      <div className="mt-4 space-y-2">
        {resources.length ? resources.map((resource) => (
          <button
            key={resource.id}
            type="button"
            onClick={() => onSelect(resource.id)}
            className={`w-full rounded-[18px] border p-4 text-left transition ${selectedResourceId === resource.id ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/8 bg-white text-[#17191f] hover:border-black/20"}`}
          >
            <p className="font-semibold">{resource.name}</p>
            <p className={`mt-1 text-xs ${selectedResourceId === resource.id ? "text-white/60" : "text-[#8a867d]"}`}>
              {t(resourceKindMessages[resource.kind])} · {resource.is_bookable ? t("Bookable") : t("Not bookable")}
            </p>
          </button>
        )) : (
          <div className="rounded-[18px] bg-white/70 p-4 text-sm leading-6 text-[#77736a]">{emptyLabel}</div>
        )}
      </div>
    </aside>
  );
}

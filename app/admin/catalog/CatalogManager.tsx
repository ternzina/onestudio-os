"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type {
  BusinessRole,
  PricingModel,
  ResourceKind,
  ServiceKind,
} from "@/lib/modules/contracts";

type CatalogTab = "services" | "resources" | "categories";
type CategoryKind = "service" | "resource";

type WorkspaceRow = {
  business_id: string;
  name: string;
  timezone: string;
  default_currency: string;
  role: BusinessRole;
  is_default: boolean;
};

type CategoryRow = {
  id: string;
  business_id: string;
  kind: CategoryKind;
  slug: string;
  name: string;
  description: string;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

type ServiceRow = {
  id: string;
  business_id: string;
  category_id: string | null;
  slug: string;
  kind: ServiceKind;
  title: string;
  description: string;
  pricing_model: PricingModel;
  price_minor: number | null;
  currency: string;
  duration_min_minutes: number | null;
  duration_max_minutes: number | null;
  duration_step_minutes: number | null;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  capacity: number;
  requires_confirmation: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

type ResourceRow = {
  id: string;
  business_id: string;
  category_id: string | null;
  slug: string;
  kind: ResourceKind;
  name: string;
  description: string;
  capacity: number;
  timezone: string | null;
  is_bookable: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

type ServiceResourceRow = {
  service_id: string;
  resource_id: string;
};

type CategoryForm = {
  id: string;
  kind: CategoryKind;
  name: string;
  slug: string;
  description: string;
  is_public: boolean;
  is_active: boolean;
  sort_order: string;
};

type ServiceForm = {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  kind: ServiceKind;
  description: string;
  pricing_model: PricingModel;
  price_major: string;
  currency: string;
  duration_min_minutes: string;
  duration_max_minutes: string;
  duration_step_minutes: string;
  buffer_before_minutes: string;
  buffer_after_minutes: string;
  capacity: string;
  requires_confirmation: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: string;
  resource_ids: string[];
};

type ResourceForm = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  kind: ResourceKind;
  description: string;
  capacity: string;
  timezone: string;
  is_bookable: boolean;
  is_public: boolean;
  is_active: boolean;
  sort_order: string;
};

const serviceKinds: readonly ServiceKind[] = ["appointment", "rental", "class", "event", "membership", "other"];
const resourceKinds: readonly ResourceKind[] = ["staff", "space", "equipment", "seat", "asset", "other"];
const pricingModels: readonly PricingModel[] = ["fixed", "per_hour", "per_person", "free", "quote"];

const transliteration: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", ґ: "g", д: "d", е: "e", ё: "e", є: "ie", ж: "zh", з: "z",
  и: "i", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "",
  ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ł: "l", đ: "d",
};

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((character) => transliteration[character] ?? character)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function optionalPositiveInteger(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function nonNegativeInteger(value: string, fallback = 0) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function moneyToMinor(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : Number.NaN;
}

function formatMoney(priceMinor: number | null, currency: string, pricingModel: PricingModel) {
  if (pricingModel === "free") return "Free";
  if (pricingModel === "quote") return "On request";
  if (priceMinor === null) return "No price";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(priceMinor / 100);
  } catch {
    return `${(priceMinor / 100).toFixed(2)} ${currency}`;
  }
}

function categoryForm(kind: CategoryKind = "service"): CategoryForm {
  return {
    id: "",
    kind,
    name: "",
    slug: "",
    description: "",
    is_public: true,
    is_active: true,
    sort_order: "0",
  };
}

function serviceForm(currency = "EUR"): ServiceForm {
  return {
    id: "",
    category_id: "",
    title: "",
    slug: "",
    kind: "appointment",
    description: "",
    pricing_model: "fixed",
    price_major: "",
    currency,
    duration_min_minutes: "60",
    duration_max_minutes: "60",
    duration_step_minutes: "30",
    buffer_before_minutes: "0",
    buffer_after_minutes: "0",
    capacity: "1",
    requires_confirmation: false,
    is_public: true,
    is_active: true,
    sort_order: "0",
    resource_ids: [],
  };
}

function resourceForm(timezone = "UTC"): ResourceForm {
  return {
    id: "",
    category_id: "",
    name: "",
    slug: "",
    kind: "space",
    description: "",
    capacity: "1",
    timezone,
    is_bookable: true,
    is_public: true,
    is_active: true,
    sort_order: "0",
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#77736a]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a742e] disabled:cursor-not-allowed disabled:opacity-55";
const checkboxClass = "h-4 w-4 rounded border-black/20 accent-[#17191f]";

export default function CatalogManager() {
  const [tab, setTab] = useState<CatalogTab>("services");
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [links, setLinks] = useState<ServiceResourceRow[]>([]);
  const [categoryDraft, setCategoryDraft] = useState<CategoryForm>(() => categoryForm());
  const [serviceDraft, setServiceDraft] = useState<ServiceForm>(() => serviceForm());
  const [resourceDraft, setResourceDraft] = useState<ResourceForm>(() => resourceForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const canConfigure = workspace
    ? workspace.role === "owner" || workspace.role === "admin" || workspace.role === "manager"
    : false;

  const serviceCategories = useMemo(
    () => categories.filter((category) => category.kind === "service"),
    [categories],
  );
  const resourceCategories = useMemo(
    () => categories.filter((category) => category.kind === "resource"),
    [categories],
  );

  const resourceNames = useMemo(
    () => new Map(resources.map((resource) => [resource.id, resource.name])),
    [resources],
  );

  const linkedResourcesByService = useMemo(() => {
    const grouped = new Map<string, string[]>();
    links.forEach((link) => {
      const current = grouped.get(link.service_id) ?? [];
      current.push(link.resource_id);
      grouped.set(link.service_id, current);
    });
    return grouped;
  }, [links]);

  const loadCatalog = useCallback(async (businessId: string) => {
    const [categoryResult, serviceResult, resourceResult, linkResult] = await Promise.all([
      supabase
        .from("catalog_categories")
        .select("id,business_id,kind,slug,name,description,is_public,is_active,sort_order")
        .eq("business_id", businessId)
        .order("kind")
        .order("sort_order")
        .order("name"),
      supabase
        .from("services")
        .select("id,business_id,category_id,slug,kind,title,description,pricing_model,price_minor,currency,duration_min_minutes,duration_max_minutes,duration_step_minutes,buffer_before_minutes,buffer_after_minutes,capacity,requires_confirmation,is_public,is_active,sort_order")
        .eq("business_id", businessId)
        .order("sort_order")
        .order("title"),
      supabase
        .from("resources")
        .select("id,business_id,category_id,slug,kind,name,description,capacity,timezone,is_bookable,is_public,is_active,sort_order")
        .eq("business_id", businessId)
        .order("sort_order")
        .order("name"),
      supabase
        .from("service_resources")
        .select("service_id,resource_id")
        .eq("business_id", businessId),
    ]);

    const firstError = categoryResult.error ?? serviceResult.error ?? resourceResult.error ?? linkResult.error;
    if (firstError) throw firstError;

    setCategories((categoryResult.data ?? []) as CategoryRow[]);
    setServices((serviceResult.data ?? []) as ServiceRow[]);
    setResources((resourceResult.data ?? []) as ResourceRow[]);
    setLinks((linkResult.data ?? []) as ServiceResourceRow[]);
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

    setServiceDraft((draft) => draft.id ? draft : serviceForm(current.default_currency));
    setResourceDraft((draft) => draft.id ? draft : resourceForm(current.timezone));

    try {
      await loadCatalog(current.business_id);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Catalog could not be loaded.");
    }

    setLoading(false);
  }, [loadCatalog]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetMessages = () => {
    setNotice("");
    setError("");
  };

  const reloadCatalog = async () => {
    if (!workspace) return;
    await loadCatalog(workspace.business_id);
  };

  const chooseCategory = (category: CategoryRow) => {
    resetMessages();
    setCategoryDraft({
      id: category.id,
      kind: category.kind,
      name: category.name,
      slug: category.slug,
      description: category.description,
      is_public: category.is_public,
      is_active: category.is_active,
      sort_order: String(category.sort_order),
    });
  };

  const chooseService = (service: ServiceRow) => {
    resetMessages();
    setServiceDraft({
      id: service.id,
      category_id: service.category_id ?? "",
      title: service.title,
      slug: service.slug,
      kind: service.kind,
      description: service.description,
      pricing_model: service.pricing_model,
      price_major: service.price_minor === null ? "" : (service.price_minor / 100).toFixed(2),
      currency: service.currency,
      duration_min_minutes: service.duration_min_minutes === null ? "" : String(service.duration_min_minutes),
      duration_max_minutes: service.duration_max_minutes === null ? "" : String(service.duration_max_minutes),
      duration_step_minutes: service.duration_step_minutes === null ? "" : String(service.duration_step_minutes),
      buffer_before_minutes: String(service.buffer_before_minutes),
      buffer_after_minutes: String(service.buffer_after_minutes),
      capacity: String(service.capacity),
      requires_confirmation: service.requires_confirmation,
      is_public: service.is_public,
      is_active: service.is_active,
      sort_order: String(service.sort_order),
      resource_ids: linkedResourcesByService.get(service.id) ?? [],
    });
  };

  const chooseResource = (resource: ResourceRow) => {
    resetMessages();
    setResourceDraft({
      id: resource.id,
      category_id: resource.category_id ?? "",
      name: resource.name,
      slug: resource.slug,
      kind: resource.kind,
      description: resource.description,
      capacity: String(resource.capacity),
      timezone: resource.timezone ?? workspace?.timezone ?? "UTC",
      is_bookable: resource.is_bookable,
      is_public: resource.is_public,
      is_active: resource.is_active,
      sort_order: String(resource.sort_order),
    });
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    if (!workspace || !canConfigure) return setError("This role cannot configure the catalog.");

    const name = categoryDraft.name.trim();
    const slug = (categoryDraft.slug.trim() || makeSlug(name)).toLowerCase();
    if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return setError("Enter a category name and a stable Latin slug.");
    }

    setSaving(true);
    const payload = {
      business_id: workspace.business_id,
      kind: categoryDraft.kind,
      name,
      slug,
      description: categoryDraft.description.trim(),
      is_public: categoryDraft.is_public,
      is_active: categoryDraft.is_active,
      sort_order: nonNegativeInteger(categoryDraft.sort_order),
    };

    const result = categoryDraft.id
      ? await supabase.from("catalog_categories").update(payload).eq("id", categoryDraft.id)
      : await supabase.from("catalog_categories").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    await reloadCatalog();
    setCategoryDraft(categoryForm(categoryDraft.kind));
    setNotice(categoryDraft.id ? "Category updated." : "Category created.");
    setSaving(false);
  };

  const saveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    if (!workspace || !canConfigure) return setError("This role cannot configure the catalog.");

    const title = serviceDraft.title.trim();
    const slug = (serviceDraft.slug.trim() || makeSlug(title)).toLowerCase();
    const priceMinor = moneyToMinor(serviceDraft.price_major);
    const durationMin = optionalPositiveInteger(serviceDraft.duration_min_minutes);
    const durationMax = optionalPositiveInteger(serviceDraft.duration_max_minutes);
    const durationStep = optionalPositiveInteger(serviceDraft.duration_step_minutes);
    const capacity = optionalPositiveInteger(serviceDraft.capacity);
    const currency = serviceDraft.currency.trim().toUpperCase();

    if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return setError("Enter a service title and a stable Latin slug.");
    }
    if (!/^[A-Z]{3}$/.test(currency)) return setError("Currency must use a three-letter code.");
    if (![durationMin, durationMax, durationStep, capacity].every((value) => value === null || !Number.isNaN(value))) {
      return setError("Duration and capacity fields must contain positive whole numbers.");
    }
    if (durationMin !== null && durationMax !== null && durationMax < durationMin) {
      return setError("Maximum duration cannot be shorter than minimum duration.");
    }
    if (serviceDraft.pricing_model !== "free" && serviceDraft.pricing_model !== "quote" && (priceMinor === null || Number.isNaN(priceMinor))) {
      return setError("This pricing model requires a valid non-negative price.");
    }

    setSaving(true);
    const payload = {
      business_id: workspace.business_id,
      category_id: serviceDraft.category_id || null,
      title,
      slug,
      kind: serviceDraft.kind,
      description: serviceDraft.description.trim(),
      pricing_model: serviceDraft.pricing_model,
      price_minor: serviceDraft.pricing_model === "free" || serviceDraft.pricing_model === "quote" ? null : priceMinor,
      currency,
      duration_min_minutes: durationMin,
      duration_max_minutes: durationMax,
      duration_step_minutes: durationStep,
      buffer_before_minutes: nonNegativeInteger(serviceDraft.buffer_before_minutes),
      buffer_after_minutes: nonNegativeInteger(serviceDraft.buffer_after_minutes),
      capacity: capacity ?? 1,
      requires_confirmation: serviceDraft.requires_confirmation,
      is_public: serviceDraft.is_public,
      is_active: serviceDraft.is_active,
      sort_order: nonNegativeInteger(serviceDraft.sort_order),
    };

    let serviceId = serviceDraft.id;
    if (serviceId) {
      const { error: updateError } = await supabase.from("services").update(payload).eq("id", serviceId);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data: inserted, error: insertError } = await supabase.from("services").insert(payload).select("id").single();
      if (insertError || !inserted) {
        setError(insertError?.message ?? "Service could not be created.");
        setSaving(false);
        return;
      }
      serviceId = (inserted as { id: string }).id;
    }

    const { error: linkError } = await supabase.rpc("replace_service_resources", {
      p_service_id: serviceId,
      p_resource_ids: serviceDraft.resource_ids,
    });
    if (linkError) {
      setError(`Service saved, but resource assignment failed: ${linkError.message}`);
      setSaving(false);
      return;
    }

    await reloadCatalog();
    setServiceDraft(serviceForm(workspace.default_currency));
    setNotice(serviceDraft.id ? "Service updated." : "Service created.");
    setSaving(false);
  };

  const saveResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    if (!workspace || !canConfigure) return setError("This role cannot configure the catalog.");

    const name = resourceDraft.name.trim();
    const slug = (resourceDraft.slug.trim() || makeSlug(name)).toLowerCase();
    const capacity = optionalPositiveInteger(resourceDraft.capacity);
    if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return setError("Enter a resource name and a stable Latin slug.");
    }
    if (capacity === null || Number.isNaN(capacity)) return setError("Capacity must be a positive whole number.");

    setSaving(true);
    const payload = {
      business_id: workspace.business_id,
      category_id: resourceDraft.category_id || null,
      name,
      slug,
      kind: resourceDraft.kind,
      description: resourceDraft.description.trim(),
      capacity,
      timezone: resourceDraft.timezone.trim() || null,
      is_bookable: resourceDraft.is_bookable,
      is_public: resourceDraft.is_public,
      is_active: resourceDraft.is_active,
      sort_order: nonNegativeInteger(resourceDraft.sort_order),
    };

    const result = resourceDraft.id
      ? await supabase.from("resources").update(payload).eq("id", resourceDraft.id)
      : await supabase.from("resources").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    await reloadCatalog();
    setResourceDraft(resourceForm(workspace.timezone));
    setNotice(resourceDraft.id ? "Resource updated." : "Resource created.");
    setSaving(false);
  };

  const removeCategory = async (category: CategoryRow) => {
    if (!canConfigure || !window.confirm(`Delete category “${category.name}”? Services and resources will remain uncategorized.`)) return;
    resetMessages();
    const { error: removeError } = await supabase.from("catalog_categories").delete().eq("id", category.id);
    if (removeError) return setError(removeError.message);
    await reloadCatalog();
    if (categoryDraft.id === category.id) setCategoryDraft(categoryForm(category.kind));
    setNotice("Category deleted.");
  };

  const removeService = async (service: ServiceRow) => {
    if (!canConfigure || !window.confirm(`Delete service “${service.title}”?`)) return;
    resetMessages();
    const { error: removeError } = await supabase.from("services").delete().eq("id", service.id);
    if (removeError) return setError(removeError.message);
    await reloadCatalog();
    if (serviceDraft.id === service.id && workspace) setServiceDraft(serviceForm(workspace.default_currency));
    setNotice("Service deleted.");
  };

  const removeResource = async (resource: ResourceRow) => {
    if (!canConfigure || !window.confirm(`Delete resource “${resource.name}”? Assigned service links will be removed.`)) return;
    resetMessages();
    const { error: removeError } = await supabase.from("resources").delete().eq("id", resource.id);
    if (removeError) return setError(removeError.message);
    await reloadCatalog();
    if (resourceDraft.id === resource.id && workspace) setResourceDraft(resourceForm(workspace.timezone));
    setNotice("Resource deleted.");
  };

  if (loading) {
    return <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8 text-sm text-[#6f6c65]">Loading catalog…</div>;
  }

  if (!workspace) {
    return <div className="mt-8 rounded-[28px] border border-amber-900/10 bg-amber-50 p-8 text-sm text-amber-900">No active workspace is assigned to this account.</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Current workspace</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{workspace.name}</h2>
          <p className="mt-1 text-sm text-[#77736a]">Role: {workspace.role} · {canConfigure ? "Catalog configuration allowed" : "Read-only catalog access"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["services", "resources", "categories"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setTab(item); resetMessages(); }}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${tab === item ? "bg-[#17191f] text-white" : "border border-black/10 bg-[#fffdfa] text-[#66645f]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {(error || notice) ? (
        <div className={`mt-4 rounded-2xl border p-4 text-sm ${error ? "border-red-900/10 bg-red-50 text-red-800" : "border-emerald-900/10 bg-emerald-50 text-emerald-800"}`}>
          {error || notice}
        </div>
      ) : null}

      {tab === "services" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Services</p>
                <p className="mt-1 text-sm text-[#77736a]">{services.length} catalog item{services.length === 1 ? "" : "s"}</p>
              </div>
              <button type="button" disabled={!canConfigure} onClick={() => setServiceDraft(serviceForm(workspace.default_currency))} className="rounded-full bg-[#17191f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">New service</button>
            </div>
            <div className="mt-5 grid gap-3">
              {services.length === 0 ? <p className="rounded-2xl bg-white/70 p-5 text-sm text-[#77736a]">No services yet.</p> : services.map((service) => {
                const category = serviceCategories.find((item) => item.id === service.category_id);
                const assigned = linkedResourcesByService.get(service.id) ?? [];
                return (
                  <article key={service.id} className={`rounded-[22px] border p-5 ${serviceDraft.id === service.id ? "border-[#17191f] bg-white" : "border-black/8 bg-white/75"}`}>
                    <button type="button" onClick={() => chooseService(service)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#9a742e]">{service.kind}{category ? ` · ${category.name}` : ""}</p>
                          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{service.title}</h3>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${service.is_active ? "bg-emerald-50 text-emerald-800" : "bg-black/5 text-[#77736a]"}`}>{service.is_active ? "Active" : "Inactive"}</span>
                      </div>
                      <p className="mt-3 text-sm text-[#66645f]">{formatMoney(service.price_minor, service.currency, service.pricing_model)}</p>
                      <p className="mt-2 text-xs text-[#8a867d]">Resources: {assigned.length ? assigned.map((id) => resourceNames.get(id) ?? "Unknown").join(", ") : "none"}</p>
                    </button>
                    {canConfigure ? <button type="button" onClick={() => void removeService(service)} className="mt-4 text-xs font-semibold text-red-700">Delete</button> : null}
                  </article>
                );
              })}
            </div>
          </section>

          <form onSubmit={saveService} className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{serviceDraft.id ? "Edit service" : "New service"}</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Offer definition</h3>
              </div>
              {serviceDraft.id ? <button type="button" onClick={() => setServiceDraft(serviceForm(workspace.default_currency))} className="text-xs font-semibold text-[#77736a]">Cancel edit</button> : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Title"><input className={inputClass} value={serviceDraft.title} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, title: event.target.value }))} /></Field>
              <Field label="Stable slug">
                <div className="flex gap-2"><input className={inputClass} value={serviceDraft.slug} disabled={!canConfigure} placeholder={makeSlug(serviceDraft.title) || "service-slug"} onChange={(event) => setServiceDraft((current) => ({ ...current, slug: event.target.value }))} /><button type="button" disabled={!canConfigure} onClick={() => setServiceDraft((current) => ({ ...current, slug: makeSlug(current.title) }))} className="rounded-2xl border border-black/10 px-3 text-xs font-semibold disabled:opacity-40">Generate</button></div>
              </Field>
              <Field label="Category"><select className={inputClass} value={serviceDraft.category_id} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, category_id: event.target.value }))}><option value="">Uncategorized</option>{serviceCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
              <Field label="Service kind"><select className={inputClass} value={serviceDraft.kind} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, kind: event.target.value as ServiceKind }))}>{serviceKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select></Field>
              <div className="sm:col-span-2"><Field label="Description"><textarea className={`${inputClass} min-h-28 resize-y`} value={serviceDraft.description} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} /></Field></div>
              <Field label="Pricing model"><select className={inputClass} value={serviceDraft.pricing_model} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, pricing_model: event.target.value as PricingModel }))}>{pricingModels.map((model) => <option key={model} value={model}>{model.replace("_", " ")}</option>)}</select></Field>
              <Field label="Price"><input className={inputClass} inputMode="decimal" value={serviceDraft.price_major} disabled={!canConfigure || serviceDraft.pricing_model === "free" || serviceDraft.pricing_model === "quote"} placeholder="50.00" onChange={(event) => setServiceDraft((current) => ({ ...current, price_major: event.target.value }))} /></Field>
              <Field label="Currency"><input className={`${inputClass} uppercase`} maxLength={3} value={serviceDraft.currency} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, currency: event.target.value }))} /></Field>
              <Field label="Capacity"><input className={inputClass} type="number" min="1" value={serviceDraft.capacity} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, capacity: event.target.value }))} /></Field>
              <Field label="Minimum duration, min"><input className={inputClass} type="number" min="1" value={serviceDraft.duration_min_minutes} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, duration_min_minutes: event.target.value }))} /></Field>
              <Field label="Maximum duration, min"><input className={inputClass} type="number" min="1" value={serviceDraft.duration_max_minutes} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, duration_max_minutes: event.target.value }))} /></Field>
              <Field label="Duration step, min"><input className={inputClass} type="number" min="1" value={serviceDraft.duration_step_minutes} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, duration_step_minutes: event.target.value }))} /></Field>
              <Field label="Buffer before, min"><input className={inputClass} type="number" min="0" value={serviceDraft.buffer_before_minutes} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, buffer_before_minutes: event.target.value }))} /></Field>
              <Field label="Buffer after, min"><input className={inputClass} type="number" min="0" value={serviceDraft.buffer_after_minutes} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, buffer_after_minutes: event.target.value }))} /></Field>
              <Field label="Sort order"><input className={inputClass} type="number" min="0" value={serviceDraft.sort_order} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, sort_order: event.target.value }))} /></Field>
            </div>

            <div className="mt-6 rounded-[22px] border border-black/8 bg-[#eeebe3] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">Required resources</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {resources.length === 0 ? <p className="text-sm text-[#77736a]">Create resources first, or save the service without assignments.</p> : resources.map((resource) => {
                  const checked = serviceDraft.resource_ids.includes(resource.id);
                  return (
                    <label key={resource.id} className="flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm">
                      <input type="checkbox" className={checkboxClass} checked={checked} disabled={!canConfigure} onChange={() => setServiceDraft((current) => ({ ...current, resource_ids: checked ? current.resource_ids.filter((id) => id !== resource.id) : [...current.resource_ids, resource.id] }))} />
                      <span>{resource.name} <span className="text-[#8a867d]">· {resource.kind}</span></span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/8 pt-6">
              <div className="flex flex-wrap gap-4 text-sm text-[#66645f]">
                <label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={serviceDraft.is_active} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, is_active: event.target.checked }))} />Active</label>
                <label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={serviceDraft.is_public} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, is_public: event.target.checked }))} />Public</label>
                <label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={serviceDraft.requires_confirmation} disabled={!canConfigure} onChange={(event) => setServiceDraft((current) => ({ ...current, requires_confirmation: event.target.checked }))} />Requires confirmation</label>
              </div>
              <button type="submit" disabled={saving || !canConfigure} className="rounded-full bg-[#17191f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40">{saving ? "Saving…" : "Save service"}</button>
            </div>
          </form>
        </div>
      ) : null}

      {tab === "resources" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-6">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Resources</p><p className="mt-1 text-sm text-[#77736a]">{resources.length} resource{resources.length === 1 ? "" : "s"}</p></div><button type="button" disabled={!canConfigure} onClick={() => setResourceDraft(resourceForm(workspace.timezone))} className="rounded-full bg-[#17191f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">New resource</button></div>
            <div className="mt-5 grid gap-3">
              {resources.length === 0 ? <p className="rounded-2xl bg-white/70 p-5 text-sm text-[#77736a]">No resources yet.</p> : resources.map((resource) => {
                const category = resourceCategories.find((item) => item.id === resource.category_id);
                return <article key={resource.id} className={`rounded-[22px] border p-5 ${resourceDraft.id === resource.id ? "border-[#17191f] bg-white" : "border-black/8 bg-white/75"}`}><button type="button" onClick={() => chooseResource(resource)} className="w-full text-left"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.14em] text-[#9a742e]">{resource.kind}{category ? ` · ${category.name}` : ""}</p><h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{resource.name}</h3></div><span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${resource.is_active ? "bg-emerald-50 text-emerald-800" : "bg-black/5 text-[#77736a]"}`}>{resource.is_active ? "Active" : "Inactive"}</span></div><p className="mt-3 text-sm text-[#66645f]">Capacity {resource.capacity} · {resource.is_bookable ? "Bookable" : "Not bookable"}</p></button>{canConfigure ? <button type="button" onClick={() => void removeResource(resource)} className="mt-4 text-xs font-semibold text-red-700">Delete</button> : null}</article>;
              })}
            </div>
          </section>

          <form onSubmit={saveResource} className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)]">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{resourceDraft.id ? "Edit resource" : "New resource"}</p><h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Capacity definition</h3></div>{resourceDraft.id ? <button type="button" onClick={() => setResourceDraft(resourceForm(workspace.timezone))} className="text-xs font-semibold text-[#77736a]">Cancel edit</button> : null}</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Name"><input className={inputClass} value={resourceDraft.name} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, name: event.target.value }))} /></Field>
              <Field label="Stable slug"><div className="flex gap-2"><input className={inputClass} value={resourceDraft.slug} disabled={!canConfigure} placeholder={makeSlug(resourceDraft.name) || "resource-slug"} onChange={(event) => setResourceDraft((current) => ({ ...current, slug: event.target.value }))} /><button type="button" disabled={!canConfigure} onClick={() => setResourceDraft((current) => ({ ...current, slug: makeSlug(current.name) }))} className="rounded-2xl border border-black/10 px-3 text-xs font-semibold disabled:opacity-40">Generate</button></div></Field>
              <Field label="Category"><select className={inputClass} value={resourceDraft.category_id} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, category_id: event.target.value }))}><option value="">Uncategorized</option>{resourceCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
              <Field label="Resource kind"><select className={inputClass} value={resourceDraft.kind} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, kind: event.target.value as ResourceKind }))}>{resourceKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select></Field>
              <div className="sm:col-span-2"><Field label="Description"><textarea className={`${inputClass} min-h-28 resize-y`} value={resourceDraft.description} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, description: event.target.value }))} /></Field></div>
              <Field label="Capacity"><input className={inputClass} type="number" min="1" value={resourceDraft.capacity} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, capacity: event.target.value }))} /></Field>
              <Field label="Timezone"><input className={inputClass} value={resourceDraft.timezone} disabled={!canConfigure} placeholder={workspace.timezone} onChange={(event) => setResourceDraft((current) => ({ ...current, timezone: event.target.value }))} /></Field>
              <Field label="Sort order"><input className={inputClass} type="number" min="0" value={resourceDraft.sort_order} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, sort_order: event.target.value }))} /></Field>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/8 pt-6">
              <div className="flex flex-wrap gap-4 text-sm text-[#66645f]">
                <label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={resourceDraft.is_active} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, is_active: event.target.checked }))} />Active</label>
                <label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={resourceDraft.is_public} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, is_public: event.target.checked }))} />Public</label>
                <label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={resourceDraft.is_bookable} disabled={!canConfigure} onChange={(event) => setResourceDraft((current) => ({ ...current, is_bookable: event.target.checked }))} />Bookable</label>
              </div>
              <button type="submit" disabled={saving || !canConfigure} className="rounded-full bg-[#17191f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40">{saving ? "Saving…" : "Save resource"}</button>
            </div>
          </form>
        </div>
      ) : null}

      {tab === "categories" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-6">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Categories</p><p className="mt-1 text-sm text-[#77736a]">Separate presentation groups for services and resources</p></div><button type="button" disabled={!canConfigure} onClick={() => setCategoryDraft(categoryForm())} className="rounded-full bg-[#17191f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">New category</button></div>
            <div className="mt-5 grid gap-3">
              {categories.length === 0 ? <p className="rounded-2xl bg-white/70 p-5 text-sm text-[#77736a]">No categories yet.</p> : categories.map((category) => <article key={category.id} className={`rounded-[22px] border p-5 ${categoryDraft.id === category.id ? "border-[#17191f] bg-white" : "border-black/8 bg-white/75"}`}><button type="button" onClick={() => chooseCategory(category)} className="w-full text-left"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.14em] text-[#9a742e]">{category.kind} category</p><h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{category.name}</h3></div><span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${category.is_active ? "bg-emerald-50 text-emerald-800" : "bg-black/5 text-[#77736a]"}`}>{category.is_active ? "Active" : "Inactive"}</span></div><p className="mt-3 text-xs text-[#8a867d]">/{category.slug} · order {category.sort_order}</p></button>{canConfigure ? <button type="button" onClick={() => void removeCategory(category)} className="mt-4 text-xs font-semibold text-red-700">Delete</button> : null}</article>)}
            </div>
          </section>

          <form onSubmit={saveCategory} className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)]">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{categoryDraft.id ? "Edit category" : "New category"}</p><h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Catalog grouping</h3></div>{categoryDraft.id ? <button type="button" onClick={() => setCategoryDraft(categoryForm(categoryDraft.kind))} className="text-xs font-semibold text-[#77736a]">Cancel edit</button> : null}</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Name"><input className={inputClass} value={categoryDraft.name} disabled={!canConfigure} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} /></Field>
              <Field label="Stable slug"><div className="flex gap-2"><input className={inputClass} value={categoryDraft.slug} disabled={!canConfigure} placeholder={makeSlug(categoryDraft.name) || "category-slug"} onChange={(event) => setCategoryDraft((current) => ({ ...current, slug: event.target.value }))} /><button type="button" disabled={!canConfigure} onClick={() => setCategoryDraft((current) => ({ ...current, slug: makeSlug(current.name) }))} className="rounded-2xl border border-black/10 px-3 text-xs font-semibold disabled:opacity-40">Generate</button></div></Field>
              <Field label="Scope"><select className={inputClass} value={categoryDraft.kind} disabled={!canConfigure || Boolean(categoryDraft.id)} onChange={(event) => setCategoryDraft((current) => ({ ...current, kind: event.target.value as CategoryKind }))}><option value="service">Services</option><option value="resource">Resources</option></select></Field>
              <Field label="Sort order"><input className={inputClass} type="number" min="0" value={categoryDraft.sort_order} disabled={!canConfigure} onChange={(event) => setCategoryDraft((current) => ({ ...current, sort_order: event.target.value }))} /></Field>
              <div className="sm:col-span-2"><Field label="Description"><textarea className={`${inputClass} min-h-28 resize-y`} value={categoryDraft.description} disabled={!canConfigure} onChange={(event) => setCategoryDraft((current) => ({ ...current, description: event.target.value }))} /></Field></div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/8 pt-6"><div className="flex flex-wrap gap-4 text-sm text-[#66645f]"><label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={categoryDraft.is_active} disabled={!canConfigure} onChange={(event) => setCategoryDraft((current) => ({ ...current, is_active: event.target.checked }))} />Active</label><label className="flex items-center gap-2"><input className={checkboxClass} type="checkbox" checked={categoryDraft.is_public} disabled={!canConfigure} onChange={(event) => setCategoryDraft((current) => ({ ...current, is_public: event.target.checked }))} />Public</label></div><button type="submit" disabled={saving || !canConfigure} className="rounded-full bg-[#17191f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40">{saving ? "Saving…" : "Save category"}</button></div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

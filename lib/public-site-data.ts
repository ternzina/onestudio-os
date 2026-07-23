import "server-only";

import {
  fallbackContactSettings,
  fallbackGlobalSettings,
  type PublicSiteSettings,
  type SiteContactSettings,
  type SiteGlobalSettings,
} from "./site-settings";
import {
  fallbackSiteHomeContent,
  preferLocalHomeImage,
  type SiteHomeContent,
} from "./home-content";
import {
  normalizeContactSettings,
  type ContactSettings,
} from "./contact-content";
import {
  fallbackSiteRentalContent,
  normalizeRentalContent,
  rentalContentSelect,
  type SiteRentalContent,
} from "./rental-content";
import {
  fallbackHomeCarouselSettings,
  normalizeCarouselDelay,
  type HomeCarouselSettings,
  type HomeCarouselSlide,
} from "./home-carousel";

async function fetchPublicRow<T extends object>(
  table: string,
  id: string | number,
  select: string,
): Promise<Partial<T> | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  const endpoint = new URL(`/rest/v1/${table}`, url);
  endpoint.searchParams.set("select", select);
  endpoint.searchParams.set("id", `eq.${id}`);
  endpoint.searchParams.set("limit", "1");

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const rows = (await response.json()) as Partial<T>[];
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function fetchPublicRows<T extends object>(
  table: string,
  select: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return [];

  const endpoint = new URL(`/rest/v1/${table}`, url);
  endpoint.searchParams.set("select", select);
  Object.entries(params).forEach(([name, value]) => endpoint.searchParams.set(name, value));

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return [];
    return (await response.json()) as T[];
  } catch {
    return [];
  }
}

function mergeDefined<T extends object>(fallback: T, row: Partial<T> | null): T {
  if (!row) return fallback;

  return Object.fromEntries(
    Object.entries(fallback).map(([key, fallbackValue]) => {
      const value = row[key as keyof T];
      return [key, value === null || value === undefined || value === "" ? fallbackValue : value];
    }),
  ) as T;
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const [contactsRow, globalRow] = await Promise.all([
    fetchPublicRow<SiteContactSettings>("site_contacts", 1, "phone,email,address"),
    fetchPublicRow<SiteGlobalSettings>(
      "site_global_settings",
      1,
      "studio_name,logo_text,instagram_url,tiktok_url,facebook_url,footer_text_uk,footer_text_pl",
    ),
  ]);

  return {
    contacts: mergeDefined(fallbackContactSettings, contactsRow),
    global: mergeDefined(fallbackGlobalSettings, globalRow),
  };
}

export async function getContactPageData(): Promise<ContactSettings> {
  const row = await fetchPublicRow<ContactSettings>(
    "site_contacts",
    1,
    "phone,email,address,hours_uk,hours_pl,google_maps_query,nip,transfer_recipient,transfer_title_uk,transfer_title_pl,bank_account,blik,instagram,instagram_url",
  );

  return normalizeContactSettings(row);
}

export async function getHomeContent(): Promise<SiteHomeContent> {
  const select = Object.keys(fallbackSiteHomeContent).join(",");
  const row = await fetchPublicRow<SiteHomeContent>("site_home_content", 1, select);
  const content = mergeDefined(fallbackSiteHomeContent, row);

  return {
    ...content,
    collage_photoshoots_image_url: preferLocalHomeImage(
      content.collage_photoshoots_image_url,
      fallbackSiteHomeContent.collage_photoshoots_image_url,
    ),
    collage_interiors_image_url: preferLocalHomeImage(
      content.collage_interiors_image_url,
      fallbackSiteHomeContent.collage_interiors_image_url,
    ),
    collage_learning_image_url: preferLocalHomeImage(
      content.collage_learning_image_url,
      fallbackSiteHomeContent.collage_learning_image_url,
    ),
    collage_equipment_image_url: preferLocalHomeImage(
      content.collage_equipment_image_url,
      fallbackSiteHomeContent.collage_equipment_image_url,
    ),
  };
}

export async function getHomeCarouselData(): Promise<{
  settings: HomeCarouselSettings;
  slides: HomeCarouselSlide[];
}> {
  const [settingsRow, slides] = await Promise.all([
    fetchPublicRow<HomeCarouselSettings>(
      "home_carousel_settings",
      1,
      "enabled,autoplay_delay_ms",
    ),
    fetchPublicRows<HomeCarouselSlide>(
      "home_carousel_slides",
      "id,image_url,title_uk,title_pl,text_uk,text_pl,alt_uk,alt_pl,is_active,sort_order",
      { is_active: "eq.true", order: "sort_order.asc,created_at.asc" },
    ),
  ]);

  const settings = mergeDefined(fallbackHomeCarouselSettings, settingsRow);

  return {
    settings: {
      ...settings,
      autoplay_delay_ms: normalizeCarouselDelay(settings.autoplay_delay_ms),
    },
    slides: slides.filter((slide) => slide.image_url?.trim()),
  };
}

export async function getPhotoshootsContentRow(): Promise<Record<
  string,
  unknown
> | null> {
  const row = await fetchPublicRow<Record<string, unknown>>(
    "site_photoshoots_content",
    1,
    "*",
  );

  return row ? { ...row } : null;
}

type RentalStudioZone = {
  id: string;
  name: string;
  name_uk: string;
  name_pl: string;
  description_uk: string;
  description_pl: string;
  image_url: string;
};

type RentalContacts = {
  address: string;
  hours_uk: string;
  hours_pl: string;
  google_maps_query: string;
};

type RentalBookingRow = {
  booking_date: string;
  booking_time: string | null;
  duration_hours: number | null;
  end_time: string | null;
  rental_resource: string | null;
  status: string | null;
};

export type RentalAvailabilityDay = {
  date: string;
  status: "partial" | "full";
};

const fallbackRentalContacts: RentalContacts = {
  address: "ul. Taśmowa 1, lok. 202, 02-677 Warszawa",
  hours_uk: "Щодня 09:00–21:00",
  hours_pl: "Codziennie 09:00–21:00",
  google_maps_query: "Taśmowa 1, lokal 202, Warszawa, Poland",
};

export async function getRentalPageData() {
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: "year" | "month" | "day") =>
    dateParts.find((item) => item.type === type)?.value || "";
  const todayInWarsaw = `${part("year")}-${part("month")}-${part("day")}`;

  const [contentRow, zones, contactsRow, bookingSettings, bookingRows] = await Promise.all([
    fetchPublicRow<SiteRentalContent>(
      "site_rental_content",
      1,
      rentalContentSelect,
    ),
    fetchPublicRows<RentalStudioZone>(
      "interiors",
      "id,name,name_uk,name_pl,description_uk,description_pl,image_url",
      { is_active: "eq.true", order: "sort_order.asc", limit: "3" },
    ),
    fetchPublicRow<RentalContacts>(
      "site_contacts",
      1,
      "address,hours_uk,hours_pl,google_maps_query",
    ),
    fetchPublicRow<{
      rental_video_enabled: boolean;
      rental_video_url: string;
      rental_calendar_enabled: boolean;
      rental_open_hour: number;
      rental_close_hour: number;
    }>(
      "booking_page_settings",
      "main",
      "rental_video_enabled,rental_video_url,rental_calendar_enabled,rental_open_hour,rental_close_hour",
    ),
    fetchPublicRows<RentalBookingRow>(
      "studio_bookings",
      "booking_date,booking_time,duration_hours,end_time,rental_resource,status",
      { booking_date: `gte.${todayInWarsaw}`, order: "booking_date.asc", limit: "1000" },
    ),
  ]);

  const openMinutes = Number(bookingSettings?.rental_open_hour || 9) * 60;
  const closeMinutes = Number(bookingSettings?.rental_close_hour || 22) * 60;
  const cancelledStatuses = new Set(["cancelled", "canceled", "deleted", "rejected"]);
  const rangesByDate = new Map<string, Array<[number, number]>>();

  const timeToMinutes = (value: string | null) => {
    if (!value) return null;
    const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  };

  bookingRows.forEach((booking) => {
    if (!booking.booking_date || booking.rental_resource === "makeup_room") return;
    if (cancelledStatuses.has((booking.status || "").toLowerCase())) return;

    const start = timeToMinutes(booking.booking_time);
    if (start === null) return;
    const savedEnd = timeToMinutes(booking.end_time);
    const end = savedEnd ?? start + Math.max(1, Number(booking.duration_hours || 1)) * 60;
    const clampedStart = Math.max(openMinutes, start);
    const clampedEnd = Math.min(closeMinutes, end);
    if (clampedEnd <= clampedStart) return;

    const current = rangesByDate.get(booking.booking_date) || [];
    current.push([clampedStart, clampedEnd]);
    rangesByDate.set(booking.booking_date, current);
  });

  const availability: RentalAvailabilityDay[] = Array.from(rangesByDate.entries()).map(([date, ranges]) => {
    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
    let occupiedMinutes = 0;
    let [rangeStart, rangeEnd] = sorted[0];

    sorted.slice(1).forEach(([start, end]) => {
      if (start <= rangeEnd) rangeEnd = Math.max(rangeEnd, end);
      else {
        occupiedMinutes += rangeEnd - rangeStart;
        rangeStart = start;
        rangeEnd = end;
      }
    });
    occupiedMinutes += rangeEnd - rangeStart;

    return {
      date,
      status: occupiedMinutes >= closeMinutes - openMinutes ? "full" : "partial",
    };
  });

  return {
    initialContent: normalizeRentalContent(contentRow || fallbackSiteRentalContent),
    initialZones: zones,
    initialContacts: mergeDefined(fallbackRentalContacts, contactsRow),
    rentalVideoEnabled: bookingSettings?.rental_video_enabled === true,
    rentalVideoUrl: bookingSettings?.rental_video_url || "/videos/training-student-story.mp4",
    calendarEnabled: bookingSettings?.rental_calendar_enabled === true,
    initialAvailability: availability,
  };
}

type LearningProgramRow = {
  id: string;
  title_uk: string;
  title_pl: string;
  description_uk: string;
  description_pl: string;
  image_url: string;
  media_type: "image" | "video";
  price_text_uk: string;
  price_text_pl: string;
  duration_uk: string;
  duration_pl: string;
  is_active: boolean;
  sort_order: number;
};

type LearningBenefitRow = {
  id: string;
  text_uk: string;
  text_pl: string;
  is_active: boolean;
  sort_order: number;
};

type LearningExtraBlock = {
  id: string;
  block_type: "text" | "image" | "video";
  title_uk: string;
  title_pl: string;
  text_uk: string;
  text_pl: string;
  media_url: string;
  placement: "after_hero" | "after_programs" | "after_benefits" | "page_bottom";
  size: "small" | "medium" | "large" | "full";
  align: "left" | "center" | "right";
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  sort_order: number;
  is_visible: boolean;
};

export async function getLearningPageData() {
  const [content, programs, benefits, extraBlocks] = await Promise.all([
    fetchPublicRow<Record<string, string | number>>(
      "site_learning_content",
      1,
      "*",
    ),
    fetchPublicRows<LearningProgramRow>(
      "learning_programs",
      "id,title_uk,title_pl,description_uk,description_pl,image_url,media_type,price_text_uk,price_text_pl,duration_uk,duration_pl,is_active,sort_order",
      { is_active: "eq.true", order: "sort_order.asc" },
    ),
    fetchPublicRows<LearningBenefitRow>(
      "learning_benefits",
      "id,text_uk,text_pl,is_active,sort_order",
      { is_active: "eq.true", order: "sort_order.asc" },
    ),
    fetchPublicRows<LearningExtraBlock>(
      "learning_extra_blocks",
      "id,block_type,title_uk,title_pl,text_uk,text_pl,media_url,placement,size,align,autoplay,muted,loop,controls,sort_order,is_visible",
      { is_visible: "eq.true", order: "sort_order.asc" },
    ),
  ]);

  return {
    dbContent: content ? { ...content } : null,
    dbPrograms: programs,
    dbBenefits: benefits,
    extraBlocks,
  };
}

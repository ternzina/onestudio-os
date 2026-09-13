"use client";
import { AdaptedCard4, type Card4Meeting } from "@/components/puck-site-editor/adapted-library/card-4";
const meetings: Card4Meeting[] = [{ id: "catalog-review", title: "Catalog review", day: "18", weekday: "Tue", window: "10:00–10:30", place: "Studio room", invited: 4 }, { id: "design-sync", title: "Design sync", day: "19", weekday: "Wed", window: "14:00–14:45", place: "Remote", invited: 6 }];
export default function CatalogCard4Preview() { return <AdaptedCard4 meetings={meetings} />; }

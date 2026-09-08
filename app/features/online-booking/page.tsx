import type { Metadata } from "next";
import FeatureDetail from "../FeatureDetail";
import { getFeature } from "@/lib/seo/features";
import { SITE_URL } from "@/app/_seo/site";

const feature = getFeature("online-booking")!;
export const metadata: Metadata = { title: feature.title, description: feature.description, alternates: { canonical: new URL(feature.path, SITE_URL).toString() }, openGraph: { type: "website", url: feature.path, title: feature.title, description: feature.description }, robots: { index: true, follow: true } };
export default function OnlineBookingPage() { return <FeatureDetail feature={feature} />; }

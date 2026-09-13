"use client";
import { AdaptedPricing3, type Pricing3Plan } from "@/components/puck-site-editor/adapted/pricing-3";
const plans: Pricing3Plan[] = [{ title: "Starter", description: "For focused teams starting their analytics practice.", price: "$19", suffix: "/mo", limit: "Up to 3 teammates", ctaLabel: "Start free" }, { title: "Scale", description: "For growing teams that need shared visibility.", price: "$49", suffix: "/mo", limit: "Up to 12 teammates", ctaLabel: "Choose Scale" }, { title: "Studio", description: "For organizations coordinating work across products.", price: "$99", suffix: "/mo", limit: "Unlimited teammates", ctaLabel: "Talk to us" }];
export default function CatalogPricing3Preview() { return <AdaptedPricing3 plans={plans} />; }

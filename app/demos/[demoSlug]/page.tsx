import { notFound } from "next/navigation";
import DemoShowcaseClient from "./DemoShowcaseClient";
import { DEMOS, getDemo } from "@/lib/demo-catalog";

export function generateStaticParams() {
  return DEMOS.map((demo) => ({ demoSlug: demo.slug }));
}

export default async function DemoShowcasePage({
  params,
}: {
  params: Promise<{ demoSlug: string }>;
}) {
  const { demoSlug } = await params;
  const demo = getDemo(demoSlug);

  if (!demo) notFound();

  return <DemoShowcaseClient demo={demo} />;
}

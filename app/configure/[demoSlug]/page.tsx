import { notFound } from "next/navigation";
import ConfiguratorClient from "./ConfiguratorClient";
import { DEMOS, getDemo } from "@/lib/demo-catalog";

export function generateStaticParams() {
  return DEMOS.map((demo) => ({ demoSlug: demo.slug }));
}

export default async function ConfigureDemoPage({
  params,
}: {
  params: Promise<{ demoSlug: string }>;
}) {
  const { demoSlug } = await params;
  const demo = getDemo(demoSlug);

  if (!demo) notFound();

  return <ConfiguratorClient demo={demo} />;
}

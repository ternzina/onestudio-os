import PuckLabV3 from "@/components/editor-lab/puck-v3/puck-lab-v3";

export default async function PuckLabV3Page({ searchParams }: { searchParams: Promise<{ coreQa?: string }> }) {
  const params = await searchParams;
  return <PuckLabV3 coreQa={params.coreQa === "1"} />;
}

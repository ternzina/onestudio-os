import { redirect } from "next/navigation";

type ClientSiteEditorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientSiteEditorPage({
  searchParams,
}: ClientSiteEditorPageProps) {
  const params = await searchParams;
  const business =
    typeof params.business === "string" ? params.business.trim() : "";

  redirect(
    business
      ? `/admin/site?business=${encodeURIComponent(business)}`
      : "/admin/site",
  );
}

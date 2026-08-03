import Link from "next/link";
import ClientDomainManager from "@/components/dashboard/ClientDomainManager";

export const dynamic = "force-dynamic";

type ClientDomainPageProps = {
  searchParams: Promise<{ business?: string | string[] }>;
};

export default async function ClientDomainPage({
  searchParams,
}: ClientDomainPageProps) {
  const params = await searchParams;
  const businessId = Array.isArray(params.business)
    ? params.business[0] || ""
    : params.business || "";

  return (
    <main className="min-h-screen bg-[#090b0f] px-4 py-6 text-[#f7f5ef] sm:px-6 sm:py-8 lg:px-10">
      <section className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center rounded-full border border-white/12 px-4 text-xs font-semibold text-white/70 transition hover:border-white/25 hover:text-white"
          >
            ← Личный кабинет
          </Link>
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d8b36a]"
          >
            OneStudio OS
          </Link>
        </header>

        <div className="mt-8">
          <ClientDomainManager businessId={businessId} />
        </div>
      </section>
    </main>
  );
}

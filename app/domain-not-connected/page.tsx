import Link from "next/link";

export const metadata = {
  title: "Домен ещё не подключён",
  robots: { index: false, follow: false },
};

type DomainNotConnectedPageProps = {
  searchParams: Promise<{ host?: string | string[] }>;
};

export default async function DomainNotConnectedPage({
  searchParams,
}: DomainNotConnectedPageProps) {
  const params = await searchParams;
  const host = Array.isArray(params.host) ? params.host[0] : params.host;

  return (
    <main className="grid min-h-screen place-items-center bg-[#090b0f] px-4 text-[#f7f5ef]">
      <section className="w-full max-w-xl rounded-[34px] border border-white/10 bg-white/[0.045] p-7 text-center sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
          OneStudio OS
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Домен ещё не подключён
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/50">
          {host ? `${host} уже направлен на OneStudio, ` : "Этот адрес "}
          но проверка DNS или публикации ещё не завершена.
        </p>
        <Link
          href="https://onestudioos.com"
          className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12]"
        >
          Перейти в OneStudio OS
        </Link>
      </section>
    </main>
  );
}

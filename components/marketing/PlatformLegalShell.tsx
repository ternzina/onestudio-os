import Link from "next/link";
import type { ReactNode } from "react";

type PlatformLegalShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  children: ReactNode;
};

export default function PlatformLegalShell({
  eyebrow,
  title,
  intro,
  updatedAt,
  children,
}: PlatformLegalShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f8f7] text-[#10262c]">
      <header className="border-b border-[#d4dfdf] bg-white/80 backdrop-blur">
        <div className="mx-auto flex min-h-20 w-[min(1120px,calc(100%-40px))] items-center justify-between gap-5">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.16em] text-[#10262c]"
          >
            <strong>ONE</strong>STUDIO{" "}
            <span className="align-top text-[9px] text-[#4b9e8b]">OS</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold text-[#5f7077]">
            <Link href="/privacy" className="hover:text-[#10262c]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#10262c]">
              Terms
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto w-[min(920px,calc(100%-40px))] py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4b8d80]">
          {eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-medium tracking-[-0.055em] sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[#627178] sm:text-lg">
          {intro}
        </p>
        <p className="mt-5 text-xs text-[#89969a]">Last updated: {updatedAt}</p>

        <div className="mt-12 space-y-10 rounded-[30px] border border-[#d4dfdf] bg-white p-6 shadow-[0_24px_70px_rgba(32,70,72,0.06)] sm:p-10">
          {children}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#d4dfdf] pt-7 text-xs text-[#6e7c82]">
          <span>OneStudio OS</span>
          <a
            href="mailto:hello@onestudioos.com"
            className="font-semibold text-[#397c70]"
          >
            hello@onestudioos.com
          </a>
        </div>
      </article>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#173239]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-[#637178]">
        {children}
      </div>
    </section>
  );
}

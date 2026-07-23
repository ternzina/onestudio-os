import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-6 text-[#f7f5ef]">
      <section className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d8b36a]">404 · OneStudio OS</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em]">This page does not exist.</h1>
        <p className="mt-5 text-base leading-7 text-[#b9b5ab]">
          The address may have changed while the new system foundation is being assembled.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#f7f5ef] px-6 py-3 text-sm font-semibold text-[#0b0d12]">
          Return home
        </Link>
      </section>
    </main>
  );
}

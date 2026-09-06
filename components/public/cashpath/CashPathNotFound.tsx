import Link from "next/link";

export default function CashPathNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-6 text-[#182b29]">
      <section className="w-full max-w-2xl rounded-[36px] border border-[#182b29]/10 bg-[#fffdf8] p-8 text-center shadow-[0_30px_100px_rgba(24,43,41,0.12)] sm:p-14">
        <p className="text-lg font-semibold tracking-tight">Cash<span className="text-[#167a6a]">Path</span></p>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#6b8f35]">404</p>
        <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">This path doesn&apos;t lead anywhere.</h1>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-[#182b29]/70">The page may have moved or the address may be incorrect.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[#182b29] px-7 text-base font-semibold text-[#f7f5ef]">Back to CashPath <span className="ml-8" aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}

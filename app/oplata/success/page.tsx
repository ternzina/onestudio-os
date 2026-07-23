import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata = {
  title: "Płatność | Sisters Photo Studio",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080604] px-5 text-[#fff7ef]">
          <p className="text-sm">Sprawdzamy płatność…</p>
        </main>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}

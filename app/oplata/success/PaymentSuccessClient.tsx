"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentResult = {
  status: string;
  bookingKind: "photoshoot" | "rental";
  reference: string;
  language: "uk" | "pl";
  amountTotal: number;
  currency: string;
};

const copy = {
  uk: {
    checking: "Перевіряємо платіж…",
    paidLabel: "Оплату підтверджено",
    paidTitle: "Дякуємо! Оплата пройшла успішно",
    paidText:
      "Бронювання та платіж збережені. Студія бачить оплату в панелі адміністратора.",
    pendingLabel: "Платіж обробляється",
    pendingTitle: "Ми ще очікуємо підтвердження",
    pendingText:
      "Не повторюйте оплату. Оновіть цю сторінку через хвилину або звʼяжіться зі студією.",
    failedLabel: "Не вдалося перевірити платіж",
    failedTitle: "Потрібна повторна перевірка",
    failedText:
      "Оплата могла пройти, але підтвердження зараз недоступне. Не платіть повторно — спочатку звʼяжіться зі студією.",
    amount: "Сплачено",
    booking: "Номер бронювання",
    back: "Повернутися на сайт",
    bookingPage: "До сторінки бронювання",
  },
  pl: {
    checking: "Sprawdzamy płatność…",
    paidLabel: "Płatność potwierdzona",
    paidTitle: "Dziękujemy! Płatność zakończona sukcesem",
    paidText:
      "Rezerwacja i płatność zostały zapisane. Studio widzi płatność w panelu administracyjnym.",
    pendingLabel: "Płatność jest przetwarzana",
    pendingTitle: "Czekamy jeszcze na potwierdzenie",
    pendingText:
      "Nie ponawiaj płatności. Odśwież tę stronę za minutę lub skontaktuj się ze studiem.",
    failedLabel: "Nie udało się sprawdzić płatności",
    failedTitle: "Płatność wymaga sprawdzenia",
    failedText:
      "Płatność mogła się udać, ale potwierdzenie jest chwilowo niedostępne. Nie płać ponownie — najpierw skontaktuj się ze studiem.",
    amount: "Zapłacono",
    booking: "Numer rezerwacji",
    back: "Wróć na stronę",
    bookingPage: "Do strony rezerwacji",
  },
} as const;

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const verifyPayment = async () => {
      if (!sessionId) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = (await response.json()) as PaymentResult & { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Payment verification failed");
        }

        setResult(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    verifyPayment();
    return () => controller.abort();
  }, [sessionId]);

  const language = result?.language === "pl" ? "pl" : "uk";
  const text = copy[language];
  const isPaid = result?.status === "paid";
  const isPending = Boolean(result && !isPaid && !hasError);
  const bookingPath =
    result?.bookingKind === "rental"
      ? "/wynajem-studia/rezerwacja"
      : "/booking-public";

  const formattedAmount = result
    ? new Intl.NumberFormat(language === "pl" ? "pl-PL" : "uk-UA", {
        style: "currency",
        currency: result.currency,
      }).format(result.amountTotal / 100)
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080604] px-5 py-10 text-[#2B1A12]">
      <section className="w-full max-w-2xl rounded-[40px] border border-white/10 bg-[#f6efe8] p-7 text-center shadow-[0_30px_120px_rgba(0,0,0,0.42)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A67C52]">
          Sisters Photo Studio
        </p>

        {isLoading ? (
          <div className="py-14">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D8C4B3] border-t-[#2B1A12]" />
            <p className="mt-5 text-sm text-[#6E5748]">{text.checking}</p>
          </div>
        ) : (
          <>
            <p
              className={`mt-8 text-xs font-semibold uppercase tracking-[0.22em] ${
                isPaid
                  ? "text-green-700"
                  : isPending
                    ? "text-[#9A681F]"
                    : "text-red-700"
              }`}
            >
              {isPaid
                ? text.paidLabel
                : isPending
                  ? text.pendingLabel
                  : text.failedLabel}
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
              {isPaid
                ? text.paidTitle
                : isPending
                  ? text.pendingTitle
                  : text.failedTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#6E5748]">
              {isPaid
                ? text.paidText
                : isPending
                  ? text.pendingText
                  : text.failedText}
            </p>

            {result && (
              <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A67C52]">
                    {text.amount}
                  </p>
                  <p className="mt-2 font-semibold">{formattedAmount}</p>
                </div>
                <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A67C52]">
                    {text.booking}
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold">
                    {result.reference}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={bookingPath}
                className="rounded-full border border-[#D8C4B3] bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] transition hover:bg-[#EADFD5]"
              >
                {text.bookingPage}
              </Link>
              <Link
                href="/"
                className="rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] transition hover:bg-[#4A2D1E]"
              >
                {text.back}
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

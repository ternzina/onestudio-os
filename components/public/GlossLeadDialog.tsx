"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type GlossLeadKind = "club" | "gift";

const giftAmounts = ["50", "100", "150", "Своя сумма"] as const;

export default function GlossLeadDialog({
  businessSlug,
  kind,
  buttonLabel,
  currency,
}: {
  businessSlug: string;
  kind: GlossLeadKind;
  buttonLabel: string;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [giftAmount, setGiftAmount] = useState<(typeof giftAmounts)[number]>("100");
  const [customAmount, setCustomAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const amountLabel = useMemo(() => {
    if (kind !== "gift") return "";
    if (giftAmount === "Своя сумма") {
      return customAmount.trim() ? `${customAmount.trim()} ${currency}` : "своя сумма";
    }
    return `${giftAmount} ${currency}`;
  }, [currency, customAmount, giftAmount, kind]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Введите имя и корректный email.");
      return;
    }
    if (kind === "gift" && giftAmount === "Своя сумма" && !customAmount.trim()) {
      setError("Укажите сумму сертификата.");
      return;
    }

    setSubmitting(true);
    const subject =
      kind === "club"
        ? "Вступление в GLOSS CLUB"
        : `Подарочный сертификат · ${amountLabel}`;
    const message =
      kind === "club"
        ? "Хочу вступить в GLOSS CLUB и получить условия участия."
        : [
            `Номинал: ${amountLabel}.`,
            recipient.trim() ? `Получатель: ${recipient.trim()}.` : "",
            deliveryDate ? `Дата отправки: ${deliveryDate}.` : "",
          ]
            .filter(Boolean)
            .join(" ");

    const { error: requestError } = await getSupabaseBrowserClient().rpc(
      "create_public_request",
      {
        p_business_slug: businessSlug,
        p_client_name: name.trim(),
        p_client_email: email.trim(),
        p_client_phone: phone.trim() || null,
        p_client_locale: "ru",
        p_business_type: kind === "club" ? "membership" : "gift_certificate",
        p_subject: subject,
        p_message: message,
        p_request_key: crypto.randomUUID(),
      },
    );
    setSubmitting(false);

    if (requestError) {
      setError("Не получилось отправить заявку. Попробуйте ещё раз.");
      return;
    }
    setComplete(true);
  }

  function close() {
    setOpen(false);
    window.setTimeout(() => {
      setComplete(false);
      setError("");
    }, 200);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center rounded-md bg-white px-6 text-xs font-semibold text-[#650a11] transition hover:bg-[#fff1ed]"
      >
        {buttonLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#22070a]/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`gloss-${kind}-title`}
            className="relative my-6 w-full max-w-xl rounded-3xl bg-[#fffaf8] p-6 text-[#3b211f] shadow-[0_32px_120px_rgba(25,0,5,0.4)] sm:p-9"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-lg"
              aria-label="Закрыть"
            >
              ×
            </button>

            {complete ? (
              <div className="py-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#a60918] text-2xl text-white">
                  ✓
                </span>
                <h2 id={`gloss-${kind}-title`} className="mt-6 font-serif text-4xl">
                  Заявка отправлена
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#75615d]">
                  Мы свяжемся с вами по email и уточним все детали.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-7 min-h-11 rounded-md bg-[#650a11] px-7 text-xs font-semibold text-white"
                >
                  Готово
                </button>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a60918]">
                  {kind === "club" ? "GLOSS CLUB" : "Подарочный сертификат"}
                </p>
                <h2 id={`gloss-${kind}-title`} className="mt-4 pr-10 font-serif text-4xl">
                  {kind === "club" ? "Стать участницей клуба" : "Выберите сертификат"}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#75615d]">
                  {kind === "club"
                    ? "Оставьте контакты — мы расскажем о клубной карте, скидке на пятый визит и сохранении любимых оттенков."
                    : "Выберите номинал. Мы уточним получателя, оплату и отправку электронного сертификата."}
                </p>

                <form onSubmit={submit} className="mt-7 grid gap-4">
                  {kind === "gift" ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {giftAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setGiftAmount(amount)}
                            aria-pressed={giftAmount === amount}
                            className={`min-h-11 rounded-xl border px-3 text-xs font-semibold ${
                              giftAmount === amount
                                ? "border-[#a60918] bg-[#a60918] text-white"
                                : "border-black/10 bg-white"
                            }`}
                          >
                            {amount === "Своя сумма" ? amount : `${amount} ${currency}`}
                          </button>
                        ))}
                      </div>
                      {giftAmount === "Своя сумма" ? (
                        <Field
                          label={`Сумма, ${currency}`}
                          value={customAmount}
                          onChange={setCustomAmount}
                          inputMode="decimal"
                        />
                      ) : null}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Имя получателя" value={recipient} onChange={setRecipient} />
                        <Field
                          label="Дата отправки"
                          value={deliveryDate}
                          onChange={setDeliveryDate}
                          type="date"
                        />
                      </div>
                    </>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Ваше имя" value={name} onChange={setName} required />
                    <Field
                      label="Email"
                      value={email}
                      onChange={setEmail}
                      type="email"
                      required
                    />
                  </div>
                  <Field label="Телефон — необязательно" value={phone} onChange={setPhone} />
                  {error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-12 rounded-xl bg-[#650a11] px-6 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {submitting
                      ? "Отправляем…"
                      : kind === "club"
                        ? "Вступить в клуб"
                        : "Оформить сертификат"}
                  </button>
                  <p className="text-center text-[11px] leading-5 text-[#8b7c79]">
                    Заявка появится у студии в разделе «Заявки».
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  inputMode?: "text" | "decimal" | "numeric";
}) {
  return (
    <label className="text-xs font-semibold text-[#5c4a47]">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-normal outline-none focus:border-[#a60918]"
      />
    </label>
  );
}

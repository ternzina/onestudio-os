"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider, useLanguage } from "../../lib/language-provider";
import type { ContactSettings } from "@/lib/contact-content";

const copy = {
  uk: {
    eyebrow: "Sisters Studio",
    titleFirst: "Контакти",
    titleSecond: "та локація",
    description:
      "Напишіть нам, забронюйте зйомку або приїжджайте подивитися простір Sisters Studio наживо.",
    contactTitle: "Звʼяжіться з нами",
    phoneTitle: "Телефон",
    emailTitle: "Email",
    addressTitle: "Адреса",
    hoursTitle: "Графік",
    instagramTitle: "Instagram",
    paymentTitle: "Дані для переказу",
    nipTitle: "NIP",
    recipientTitle: "Отримувач",
    transferTitle: "Призначення",
    accountTitle: "Номер рахунку",
    blikTitle: "Blik",
    callButton: "Подзвонити",
    writeButton: "Написати",
    mapsLabel: "Google Maps",
    mapTitle: "Як нас знайти",
    mapText:
      "Ми знаходимося у Варшаві. Натисніть на карту, щоб відкрити маршрут у Google Maps.",
    showMap: "Показати карту",
  },
  pl: {
    eyebrow: "Sisters Studio",
    titleFirst: "Kontakt",
    titleSecond: "i lokalizacja",
    description:
      "Napisz do nas, zarezerwuj sesję albo przyjedź zobaczyć przestrzeń Sisters Studio na żywo.",
    contactTitle: "Skontaktuj się z nami",
    phoneTitle: "Telefon",
    emailTitle: "Email",
    addressTitle: "Adres",
    hoursTitle: "Godziny",
    instagramTitle: "Instagram",
    paymentTitle: "Dane do przelewu",
    nipTitle: "NIP",
    recipientTitle: "Odbiorca",
    transferTitle: "Tytuł",
    accountTitle: "Nr konta",
    blikTitle: "Blik",
    callButton: "Zadzwoń",
    writeButton: "Napisz",
    mapsLabel: "Google Maps",
    mapTitle: "Jak nas znaleźć",
    mapText:
      "Znajdujemy się w Warszawie. Kliknij mapę, aby otworzyć trasę w Google Maps.",
    showMap: "Pokaż mapę",
  },
} as const;

function ContactContent({ contacts }: { contacts: ContactSettings }) {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [showMap, setShowMap] = useState(false);

  const phoneHref = `tel:${contacts.phone.replace(/[^\d+]/g, "")}`;
  const emailHref = `mailto:${contacts.email}`;

  const mapQuery = contacts.google_maps_query || contacts.address;

  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const googleMapsOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const instagramHref = (() => {
    if (contacts.instagram_url.trim()) {
      return contacts.instagram_url.trim();
    }

    const handle = contacts.instagram.trim().replace(/^@/, "");

    if (!handle) {
      return "";
    }

    return `https://www.instagram.com/${handle}`;
  })();

  const contactItems = [
    {
      title: t.phoneTitle,
      text: contacts.phone,
      href: phoneHref,
    },
    {
      title: t.emailTitle,
      text: contacts.email,
      href: emailHref,
    },
    {
      title: t.addressTitle,
      text: contacts.address,
      href: googleMapsOpenUrl,
      external: true,
    },
    {
      title: t.hoursTitle,
      text: lang === "uk" ? contacts.hours_uk : contacts.hours_pl,
    },
    ...(contacts.instagram.trim()
      ? [
          {
            title: t.instagramTitle,
            text: contacts.instagram,
            href: instagramHref,
            external: true,
          },
        ]
      : []),
  ];

  const bankDetails = [
    {
      title: t.recipientTitle,
      text: contacts.transfer_recipient,
    },
    {
      title: t.transferTitle,
      text: lang === "uk" ? contacts.transfer_title_uk : contacts.transfer_title_pl,
    },
    {
      title: t.accountTitle,
      text: contacts.bank_account,
    },
    ...(contacts.blik.trim()
      ? [
          {
            title: t.blikTitle,
            text: contacts.blik,
          },
        ]
      : []),
  ].filter((item) => item.text.trim().length > 0);

  const shouldShowPayment =
    contacts.nip.trim().length > 0 || bankDetails.length > 0;

  return (
    <main className="min-h-screen bg-[#0B0908] text-[#FFF7F2]">
      <Header />

      <section className="relative overflow-hidden px-5 pb-24 pt-36 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(245,162,183,0.15),transparent_30%),radial-gradient(circle_at_18%_34%,rgba(92,51,43,0.55),transparent_34%),linear-gradient(180deg,#0B0908_0%,#080504_100%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.45em] text-[#F5A2B7]/80">
              {t.eyebrow}
            </p>

            <h1 className="font-serif text-5xl leading-[0.95] text-[#FFF7F2] sm:text-7xl lg:text-8xl">
              {t.titleFirst}
              <span className="block text-[#F5A2B7]">{t.titleSecond}</span>
            </h1>

            <p className="mt-8 text-lg leading-8 text-[#E7D8CF]">
              {t.description}
            </p>

          </div>

          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[36px] border border-[#F5A2B7]/20 bg-[#100A08]/76 p-8 shadow-[0_0_60px_rgba(245,162,183,0.06)] sm:p-10">
              <h2 className="font-serif text-4xl text-[#FFF7F2]">
                {t.contactTitle}
              </h2>

              <div className="mt-9 grid gap-5">
                {contactItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-[#F5A2B7]/18 bg-[#120B09]/80 p-6"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#F5A2B7]">
                      {item.title}
                    </p>

                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                        className="mt-3 block text-lg text-[#E7D8CF] transition hover:text-[#F5A2B7]"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <p className="mt-3 text-lg text-[#E7D8CF]">{item.text}</p>
                    )}
                  </div>
                ))}
              </div>

              {shouldShowPayment && (
                <div className="mt-6 rounded-[28px] border border-[#F5A2B7]/22 bg-[#160D0A]/85 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F5A2B7]">
                    {t.paymentTitle}
                  </p>

                  {contacts.nip.trim() && (
                    <div className="mt-5 rounded-[20px] border border-[#F5A2B7]/14 bg-[#100A08]/70 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5A2B7]/90">
                        {t.nipTitle}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#FFF7F2]">
                        {contacts.nip}
                      </p>
                    </div>
                  )}

                  {bankDetails.length > 0 && (
                    <div className="mt-5 grid gap-4">
                      {bankDetails.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-[20px] border border-[#F5A2B7]/14 bg-[#100A08]/70 p-5"
                        >
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5A2B7]/90">
                            {item.title}
                          </p>
                          <p className="mt-2 break-words text-lg text-[#E7D8CF]">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href={phoneHref}
                  className="inline-flex items-center justify-center rounded-xl bg-[#F5A2B7] px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#150B09] shadow-[0_0_38px_rgba(245,162,183,0.24)] transition hover:scale-[1.02]"
                >
                  {t.callButton}
                </a>

                <a
                  href={emailHref}
                  className="inline-flex items-center justify-center rounded-xl border border-[#F5A2B7]/45 px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5A2B7] transition hover:bg-[#F5A2B7]/10"
                >
                  {t.writeButton}
                </a>
              </div>
            </div>

            <div className="relative min-h-[560px] overflow-hidden rounded-[36px] border border-[#F5A2B7]/22 bg-[#120B09] shadow-[0_0_60px_rgba(245,162,183,0.08)]">
              {showMap ? (
                <iframe
                  title="Sisters Studio Google Maps"
                  src={googleMapsEmbedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="absolute inset-0 flex items-start justify-center bg-[radial-gradient(circle_at_50%_18%,rgba(245,162,183,0.16),transparent_34%),linear-gradient(145deg,#180E0B,#0B0908)] pt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#F5A2B7] sm:pt-10"
                  aria-label={t.showMap}
                >
                  <span className="rounded-full border border-[#F5A2B7]/40 bg-[#0B0908]/80 px-7 py-4 shadow-2xl backdrop-blur-md">
                    {t.showMap}
                  </span>
                </button>
              )}

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,9,8,0.08)_0%,rgba(11,9,8,0.78)_100%)]" />

              <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-8">
                <div className="rounded-[28px] border border-[#F5A2B7]/22 bg-[#0B0908]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#F5A2B7]">
                    {t.mapsLabel}
                  </p>

                  <h2 className="mt-4 font-serif text-3xl text-[#FFF7F2] sm:text-4xl">
                    {t.mapTitle}
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#D7C8C0]">
                    {t.mapText}
                  </p>

                  <a
                    href={googleMapsOpenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-center rounded-xl border border-[#F5A2B7]/45 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#F5A2B7] transition hover:bg-[#F5A2B7]/10"
                  >
                    {contacts.address}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ContactPageClient({ contacts }: { contacts: ContactSettings }) {
  return (
    <LanguageProvider>
      <ContactContent contacts={contacts} />
    </LanguageProvider>
  );
}

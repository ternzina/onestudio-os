"use client";

import { useMemo } from "react";
import Image from "next/image";
import PremiumContainer from "@/components/ui/PremiumContainer";
import { useLanguage } from "../../lib/language-provider";
import { useSiteSettings } from "@/lib/site-settings-provider";
import { fallbackGlobalSettings } from "@/lib/site-settings";

const footerText = {
  uk: {
    studio: "PHOTO STUDIO",
    navTitle: "Навігація",
    nav: [
      { label: "Головна", href: "/" },
      { label: "Оренда студії", href: "/wynajem-studia" },
      { label: "Фотосесії", href: "/sesje-zdjeciowe" },
      { label: "Портфоліо", href: "/portfolio" },
      { label: "Команда", href: "/sesje-zdjeciowe#team" },
      { label: "Контакти", href: "/kontakt" },
      { label: "Regulamin", href: "/regulamin" },
      { label: "Політика конфіденційності", href: "/polityka-prywatnosci" },
    ],
    contactsTitle: "Контакти",
    socialsTitle: "Соціальні мережі",
    noSocials: "Соцмережі поки не вказані",
    login: "Увійти",
    rights: "Усі права захищені.",
  },
  pl: {
    studio: "PHOTO STUDIO",
    navTitle: "Nawigacja",
    nav: [
      { label: "Strona główna", href: "/" },
      { label: "Wynajem studia", href: "/wynajem-studia" },
      { label: "Sesje zdjęciowe", href: "/sesje-zdjeciowe" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Zespół", href: "/sesje-zdjeciowe#team" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "Regulamin", href: "/regulamin" },
      { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
    ],
    contactsTitle: "Kontakt",
    socialsTitle: "Social media",
    noSocials: "Social media nie są jeszcze podane",
    login: "Zaloguj się",
    rights: "Wszelkie prawa zastrzeżone.",
  },
} as const;

const getPhoneHref = (phone: string) => {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
};

const getMailHref = (email: string) => {
  return `mailto:${email.trim()}`;
};

export default function Footer() {
  const { lang } = useLanguage();
  const text = footerText[lang];
  const { contacts: contactSettings, global: globalSettings } =
    useSiteSettings();

  const footerDescription =
    lang === "pl"
      ? globalSettings.footer_text_pl
      : globalSettings.footer_text_uk;

  const logoParts = useMemo(() => {
    const cleanLogoText =
      globalSettings.logo_text.trim() || fallbackGlobalSettings.logo_text;
    const parts = cleanLogoText.split(/\s+/);
    const main = parts[0] || "Sisters";
    const subtitle = parts.slice(1).join(" ") || text.studio;

    return {
      main: main.toUpperCase(),
      subtitle: subtitle.toUpperCase(),
    };
  }, [globalSettings.logo_text, text.studio]);

  const socials = [
    { label: "Instagram", href: globalSettings.instagram_url.trim() },
    { label: "TikTok", href: globalSettings.tiktok_url.trim() },
    { label: "Facebook", href: globalSettings.facebook_url.trim() },
  ].filter((item) => item.href.length > 0);

  const copyrightName =
    globalSettings.studio_name.trim() || fallbackGlobalSettings.studio_name;

  return (
    <footer className="border-t border-[#2B211C] bg-[#080707] py-20">
      <PremiumContainer>
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <Image
                src="/images/brand/sisters-logo-icon.webp"
                alt={copyrightName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-2xl object-cover"
              />

              <div>
                <h2 className="text-3xl font-light tracking-[0.22em] text-[#F4A6B7]">
                  {logoParts.main}
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.38em] text-[#E8D2C0]">
                  {logoParts.subtitle}
                </p>
              </div>
            </div>

            <p className="max-w-[280px] text-sm leading-7 text-[#BFAF9E]">
              {footerDescription}
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-lg text-white">{text.navTitle}</h3>
            <ul className="space-y-3 text-[#BFAF9E]">
              {text.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="transition-colors duration-300 hover:text-[#F4A6B7]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg text-white">{text.contactsTitle}</h3>
            <ul className="space-y-3 text-[#BFAF9E]">
              <li>
                <a
                  href={getPhoneHref(contactSettings.phone)}
                  className="transition-colors duration-300 hover:text-[#F4A6B7]"
                >
                  {contactSettings.phone}
                </a>
              </li>
              <li>
                <a
                  href={getMailHref(contactSettings.email)}
                  className="transition-colors duration-300 hover:text-[#F4A6B7]"
                >
                  {contactSettings.email}
                </a>
              </li>
              <li>{contactSettings.address}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg text-white">{text.socialsTitle}</h3>

            {socials.length > 0 ? (
              <ul className="space-y-3 text-[#BFAF9E]">
                {socials.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors duration-300 hover:text-[#F4A6B7]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-7 text-[#BFAF9E]">
                {text.noSocials}
              </p>
            )}

            <a
              href="/login"
              className="mt-7 inline-flex items-center justify-center rounded-full border border-[#F4A6B766] bg-[#F4A6B70D] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4A6B7] transition-all duration-300 hover:border-[#F4A6B7] hover:bg-[#F4A6B7] hover:text-[#080707] hover:shadow-[0_14px_35px_rgba(244,166,183,0.2)]"
            >
              {text.login}
            </a>
          </div>
        </div>

        <div className="mt-16 border-t border-[#2B211C] pt-8 text-center text-sm text-[#8C7A6D]">
          © 2026 {copyrightName}. {text.rights}
        </div>
      </PremiumContainer>
    </footer>
  );
}

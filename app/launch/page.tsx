"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MarketingBrand from "@/components/marketing/MarketingBrand";
import { supabase } from "@/lib/supabase";

type PendingConfiguration = {
  demoSlug: string;
  businessName: string;
  tagline: string;
  paletteIndex: number;
  modules: string[];
  languages: string[];
  currency: string;
  onlinePayment: boolean;
  reminders: boolean;
};

const localeCodes: Record<string, string> = {
  Русский: "ru",
  English: "en",
  Українська: "uk",
  Polski: "pl",
};

const moduleKeys: Record<string, string> = {
  Сайт: "core",
  Аренда: "scheduling",
  Фотосессии: "scheduling",
  Календарь: "scheduling",
  Оплата: "payments",
  Портфолио: "portfolio",
  Услуги: "catalog",
  Мастера: "catalog",
  "Онлайн-запись": "scheduling",
  Сертификаты: "payments",
  CRM: "crm",
  Расписание: "scheduling",
  Тренеры: "catalog",
  Группы: "scheduling",
  Абонементы: "payments",
  Каталог: "catalog",
  Доставка: "catalog",
  "Мастер-классы": "scheduling",
  Программы: "catalog",
  Консультации: "crm",
  Запись: "scheduling",
  Депозиты: "payments",
  "Проверка даты": "scheduling",
  Пакеты: "catalog",
  Договоры: "documents",
  Галереи: "portfolio",
  "Карточки питомцев": "crm",
  Напоминания: "notifications",
};

export default function LaunchPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Проверяем учётную запись…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function launch() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace("/login?next=/launch");
        return;
      }

      const stored = window.localStorage.getItem("onestudio-config:pending");
      if (!stored) {
        setMessage("Сохранённая конфигурация не найдена. Вернитесь к выбору демо.");
        setFailed(true);
        return;
      }

      let config: PendingConfiguration;
      try {
        config = JSON.parse(stored) as PendingConfiguration;
      } catch {
        setMessage("Не удалось прочитать сохранённую конфигурацию.");
        setFailed(true);
        return;
      }

      setMessage("Создаём отдельный сайт и рабочее пространство…");
      const locales = config.languages.map((item) => localeCodes[item]).filter(Boolean);
      const enabledModules = [...new Set([
        "core",
        "catalog",
        "crm",
        ...config.modules.map((item) => moduleKeys[item]).filter(Boolean),
        ...(config.onlinePayment ? ["payments"] : []),
        ...(config.reminders ? ["notifications"] : []),
      ])];

      const { error } = await supabase.rpc("create_configured_workspace", {
        p_configuration: {
          demo_slug: config.demoSlug,
          business_name: config.businessName,
          tagline: config.tagline,
          palette_index: config.paletteIndex,
          locales,
          currency: config.currency,
          enabled_modules: enabledModules,
        },
      });

      if (error) {
        if (error.message === "account_already_has_workspace") {
          window.localStorage.removeItem("onestudio-config:pending");
          router.replace("/admin");
          router.refresh();
          return;
        }
        setMessage(error.message || "Не удалось создать проект.");
        setFailed(true);
        return;
      }

      window.localStorage.removeItem("onestudio-config:pending");
      router.replace("/admin");
      router.refresh();
    }

    void launch();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf2f0] px-5 text-[#10242a]">
      <section className="w-full max-w-lg rounded-[32px] border border-[#d3dedc] bg-white/80 p-8 text-center shadow-xl">
        <div className="flex justify-center"><MarketingBrand /></div>
        <h1 className="mt-8 text-3xl font-medium tracking-[-0.05em]">
          {failed ? "Нужен ещё один шаг" : "Подготавливаем ваш проект"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#607478]">{message}</p>
        {failed ? (
          <Link className="mt-7 inline-flex rounded-full bg-[#17343a] px-6 py-3 text-sm font-semibold text-white" href="/demos">
            Вернуться к демо
          </Link>
        ) : (
          <div className="mx-auto mt-7 h-2 w-40 overflow-hidden rounded-full bg-[#dce7e4]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#4b9a89]" />
          </div>
        )}
      </section>
    </main>
  );
}

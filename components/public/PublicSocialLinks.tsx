import type { PublicSiteContent } from "@/lib/public-site/types";

const platformMarks: Record<string, string> = {
  instagram: "IG",
  facebook: "f",
  youtube: "▶",
  tiktok: "♪",
  linkedin: "in",
  pinterest: "P",
  telegram: "✈",
  x: "X",
};

export default function PublicSocialLinks({
  content,
  light = false,
}: {
  content: Pick<PublicSiteContent, "show_social_icons" | "social_links">;
  light?: boolean;
}) {
  if (content.show_social_icons !== true) return null;
  const links = (content.social_links ?? []).filter(
    (item) => item.url && item.platform,
  );
  if (!links.length) return null;

  return (
    <nav aria-label="Социальные сети" className="flex flex-wrap items-center gap-2">
      {links.map((item) => {
        const platform = item.platform.trim().toLowerCase();
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            aria-label={item.platform}
            title={item.platform}
            className={`grid h-9 min-w-9 place-items-center rounded-full border px-2 text-[10px] font-semibold transition hover:-translate-y-0.5 ${
              light
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-black/12 text-black/65 hover:bg-black/5"
            }`}
          >
            {platformMarks[platform] ?? item.platform.slice(0, 2).toUpperCase()}
          </a>
        );
      })}
    </nav>
  );
}

import Image from "next/image";

type PremiumImageProps = {
  src?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export default function PremiumImage({
  src,
  title,
  subtitle,
  className = "",
}: PremiumImageProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border border-[#D4A37333] bg-[#171312] shadow-[0_24px_70px_rgba(0,0,0,0.35)] ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={title}
          width={900}
          height={1200}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#2A1D17] via-[#5B3928] to-[#0B0908]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0908E6] via-[#0B090855] to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-7">
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[#D4A373]">
          Sisters
        </p>

        <h3 className="text-3xl font-light text-[#F7EFE6]">{title}</h3>

        {subtitle && (
          <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#CDBAA8]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
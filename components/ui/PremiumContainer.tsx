type PremiumContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PremiumContainer({
  children,
  className = "",
}: PremiumContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-6 md:px-8 xl:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
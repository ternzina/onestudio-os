import Link from "next/link";

export function MarketingMark() {
  return (
    <span className="os-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function MarketingBrand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="os-brand" aria-label="OneStudio OS">
      <MarketingMark />
      <span><b>ONE</b>STUDIO <em>OS</em></span>
    </Link>
  );
}

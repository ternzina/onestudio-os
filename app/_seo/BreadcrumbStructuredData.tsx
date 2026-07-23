type BreadcrumbItem = {
  name: string;
  path: string;
};

export default function BreadcrumbStructuredData({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, "https://sistersstudio.pl").toString(),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

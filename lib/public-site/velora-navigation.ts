type VeloraNavigationPage = {
  nav_label: string;
  slug: string;
};

export function buildVeloraPageHref(basePath: string, pageSlug: string) {
  const normalizedBasePath =
    basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  const normalizedSlug = pageSlug.replace(/^\/+|\/+$/g, "");
  const route = basePath.startsWith("/demos/")
    ? normalizedSlug
    : `p/${normalizedSlug}`;

  return `${normalizedBasePath}/${route}`;
}

export function resolveVeloraPageSlug(
  pages: VeloraNavigationPage[],
  navigationLabel: string,
  fallbackSlug: string,
) {
  return (
    pages.find((page) => page.nav_label === navigationLabel)?.slug ??
    fallbackSlug
  );
}

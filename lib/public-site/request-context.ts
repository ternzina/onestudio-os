import { headers } from "next/headers";

export type PublicSiteRequestContext = {
  customDomain: string | null;
  origin: string | null;
  cleanUrls: boolean;
};

export async function getPublicSiteRequestContext(): Promise<PublicSiteRequestContext> {
  const headerStore = await headers();
  const customDomain = headerStore.get("x-onestudio-custom-domain");

  if (!customDomain) {
    return { customDomain: null, origin: null, cleanUrls: false };
  }

  const protocol = headerStore.get("x-forwarded-proto") || "https";
  return {
    customDomain,
    origin: `${protocol}://${customDomain}`,
    cleanUrls: true,
  };
}

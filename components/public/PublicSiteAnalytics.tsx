import Script from "next/script";
import PublicSiteAdSense from "@/components/public/PublicSiteAdSense";
import type { PublicSiteContent } from "@/lib/public-site/types";

export default function PublicSiteAnalytics({
  content,
}: {
  content: Pick<
    PublicSiteContent,
    "google_analytics_id" | "meta_pixel_id"
  >;
}) {
  const googleId = content.google_analytics_id;
  const metaPixelId = content.meta_pixel_id;

  return (
    <>
      <PublicSiteAdSense />
      {googleId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleId}`}
            strategy="afterInteractive"
          />
          <Script id={`ga4-${googleId}`} strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {metaPixelId ? (
        <Script id={`meta-pixel-${metaPixelId}`} strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}

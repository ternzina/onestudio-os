import type { NextConfig } from "next";

const privateRoutes = [
  "/admin",
  "/admin/:path*",
  "/dashboard",
  "/dashboard/:path*",
  "/api/:path*",
  "/login",
  "/register",
  "/reset-password",
  "/gallery/:path*",
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/journal",
        statusCode: 301,
      },
      {
        source: "/blog/how-online-booking-works-for-service-businesses",
        destination: "/guides/how-online-booking-works-for-service-businesses",
        statusCode: 301,
      },
      {
        source: "/blog/website-builder-with-crm-guide",
        destination: "/guides/website-builder-with-crm-guide",
        statusCode: 301,
      },
      {
        source: "/blog/beauty-salon-website-booking-guide",
        destination: "/guides/beauty-salon-website-booking-guide",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return privateRoutes.map((source) => ({
      source,
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      ],
    }));
  },
};

export default nextConfig;

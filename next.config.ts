import type { NextConfig } from "next";

const noIndexSources = [
  "/admin",
  "/admin/:path*",
  "/dashboard",
  "/dashboard/:path*",
  "/api/:path*",
  "/login",
  "/register",
  "/reset-password",
  "/booking",
  "/booking/:path*",
  "/booking-public",
  "/booking-public/:path*",
  "/wynajem-studia/rezerwacja",
  "/wynajem-studia/rezerwacja/:path*",
];

const noIndexHeaders = noIndexSources.map((source) => ({
  source,
  headers: [
    {
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive",
    },
  ],
}));

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sistersstudio.pl",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return noIndexHeaders;
  },
};

export default nextConfig;

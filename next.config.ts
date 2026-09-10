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
        source: "/blog/:slug",
        destination: "/journal/:slug",
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

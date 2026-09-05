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
  // The local review server is intentionally opened on 127.0.0.1. Next 16
  // otherwise rejects its development-only client assets/HMR connection when
  // the server was initialized with the default localhost origin.
  allowedDevOrigins: ["127.0.0.1"],
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

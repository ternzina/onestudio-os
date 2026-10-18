import type { NextConfig } from "next";
import redirects from "./data/redirects.json";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return redirects as Array<{ source: string; destination: string; statusCode: 301 }>;
  },
};

export default nextConfig;

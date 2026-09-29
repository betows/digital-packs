import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/download": ["./packs/**/*"],
    "/api/invoicebatch/cli": ["./packs/**/*"],
  },
};

export default nextConfig;

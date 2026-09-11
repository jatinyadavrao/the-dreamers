import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the DevSpaces proxy host to load Next.js dev resources (client JS/HMR)
  // so the site renders when opened through the proxy URL.
  allowedDevOrigins: [
    "ds-62a3gjx9--3000.ap-northeast-1.prod.proxy.devspaces.amazon.dev",
  ],
};

export default nextConfig;

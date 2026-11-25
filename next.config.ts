import type { NextConfig } from "next";

// Baseline browser protections on every response: no MIME sniffing, no framing (clickjacking),
// referrers trimmed to the origin across sites, and no access to device features the site never uses.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Allow the DevSpaces proxy host to load Next.js dev resources (client JS/HMR)
  // so the site renders when opened through the proxy URL.
  allowedDevOrigins: [
    "ds-62a3gjx9--3000.ap-northeast-1.prod.proxy.devspaces.amazon.dev",
  ],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

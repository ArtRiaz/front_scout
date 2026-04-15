import type { NextConfig } from "next";

/** Trim trailing slashes for rewrite destination. */
function trimEndSlash(s: string) {
  return s.replace(/\/+$/, "");
}

/**
 * Proxy browser requests from same origin `/api/*` to the real FastAPI server.
 * Set on Vercel (or local): API_PROXY_ORIGIN=https://your-api-host.tld
 * Then the mini-app can call fetch("/api/...") without NEXT_PUBLIC_API_URL and without ?api= in the WebApp URL.
 */
const apiProxyOrigin =
  process.env.API_PROXY_ORIGIN?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();

const nextConfig: NextConfig = {
  /**
   * Inlined into the client bundle at build time so `getApiBase()` works even when
   * Telegram opens the Web App without `?api=` (Vercel: set API_PROXY_ORIGIN or NEXT_PUBLIC_API_URL).
   */
  env: {
    NEXT_PUBLIC_API_PROXY_ORIGIN: apiProxyOrigin ?? "",
    NEXT_PUBLIC_ENABLE_MULTI_FLOW: process.env.NEXT_PUBLIC_ENABLE_MULTI_FLOW ?? "false",
  },
  async rewrites() {
    if (!apiProxyOrigin) return [];
    const base = trimEndSlash(apiProxyOrigin);
    return [{ source: "/api/:path*", destination: `${base}/api/:path*` }];
  },
};

export default nextConfig;

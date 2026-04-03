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
  async rewrites() {
    if (!apiProxyOrigin) return [];
    const base = trimEndSlash(apiProxyOrigin);
    return [{ source: "/api/:path*", destination: `${base}/api/:path*` }];
  },
};

export default nextConfig;

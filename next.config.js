/** @type {import('next').NextConfig} */

// === 安全 Headers（P2 fix from 06-26 02:50 attack audit）===
// 来源: marketing/attack_test_20260626 — SM 单独缺安全 header (HSTS 之外全无)
// 对比 PodCrisp 全套已有，本次搬来同款
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com https://rsms.me",
      "connect-src 'self' https://thesellermind.com https://*.thesellermind.com https://vitals.vercel-insights.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thesellermind.com',
      },
      {
        protocol: 'https',
        hostname: '*.thesellermind.com',
      },
    ],
  },
  async redirects() {
    // ============================================================
    // P1-B fix (2026-07-17 QA report): salvage external inbound links
    // that were dead in prior deployments. Source-of-truth HTML has
    // already been updated to correct paths; these 301s catch stragglers.
    // ============================================================
    return [
      // Legacy tool routes (used in earlier landing-page footers)
      { source: '/tools/title-tag-helper', destination: '/tools/etsy-title-generator', permanent: true },
      { source: '/etsy-seo-tool',          destination: '/tools/etsy-seo-tool',        permanent: true },
      { source: '/etsy-keyword-research',  destination: '/tools/etsy-tag-generator',   permanent: true },
      // /etsy-seo/ (with trailing slash) — Next.js already handles trailing-slash
      // normalization; this explicit rule guarantees a 301 to the new index.
      { source: '/etsy-seo/',              destination: '/etsy-seo',                   permanent: true },
      // Short-slug legacy URLs: /etsy-seo/<short> -> /etsy-seo/etsy-seo-guide-for-<short>-sellers
      // Negative lookahead excludes canonical slugs (which already start with 'etsy-seo-guide-for-').
      {
        source: '/etsy-seo/:slug((?!etsy-seo-guide-for-).+)',
        destination: '/etsy-seo/etsy-seo-guide-for-:slug-sellers',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // /etsy-seo/<slug> → serve static HTML from public/etsy-seo/<slug>.html
    // 30 programmatic SEO pages rescued from prod CLI-only deploy
    // and committed to git as the single source of truth.
    return [
      {
        source: '/etsy-seo/:slug(etsy-seo-guide-for-[a-z0-9-]+-sellers)',
        destination: '/etsy-seo/:slug.html',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */

// === 安全 Headers ===
// 来源：06-26 02:50 attack audit — SM 单独缺安全 header (HSTS 之外全无)。
//
// Content-Security-Policy 已迁出到 middleware.ts (2026-07-01 P3 fix)：
// 静态 CSP 无法带 per-request nonce，故 CSP header 现在由 middleware 每次
// 请求即时生成并附加。此文件仅保留与请求无关的静态安全 header。
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
  async rewrites() {
    // /etsy-seo/<slug> → serve static HTML from public/etsy-seo/<slug>.html
    // 30 programmatic SEO pages rescued from prod CLI-only deploy
    // and committed to git as the single source of truth.
    return [
      {
        source: '/etsy-seo/:slug',
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

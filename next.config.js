/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;

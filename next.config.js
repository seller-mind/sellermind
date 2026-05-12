/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/types'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;

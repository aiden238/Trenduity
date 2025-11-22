const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/types'],
  
  // 성능 최적화
  swcMinify: true, // SWC로 압축 (Terser보다 빠름)
  
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  
  // 번들 최적화
  experimental: {
    optimizePackageImports: ['@repo/ui', 'react-icons'],
  },
  
  // 프로덕션 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = withBundleAnalyzer(nextConfig);

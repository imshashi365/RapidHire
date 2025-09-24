/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponents: true,
  },
  images: {
    domains: [
      'localhost',
      'rapidhire.today',
      'vercel.app',
      '*.vercel.app',
      '*.vercel.com'
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:company/careers',
        destination: '/[company]/careers',
      },
    ];
  },
};

export default nextConfig;

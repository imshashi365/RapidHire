let userConfig = undefined
try {

  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {

    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {

  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true, // Required for static exports
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
  },

  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/login': { page: '/login' },
      '/register': { page: '/register' },

    };
  },
  // Disable static optimization for API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },

  reactStrictMode: true,
  // Configure webpack
  webpack: (config, { isServer }) => {

    return config;
  },
  ...(userConfig?.default || {})
}

export default nextConfig

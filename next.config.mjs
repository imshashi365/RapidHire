let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config.mjs');
} catch (e) {
  try {
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // Ignore if no user config is found
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
  // Removed static export since we're using dynamic API routes
  output: undefined,
  images: {
    // Using optimized images for better performance
    domains: ['localhost', 'rapidhire.example.com'], // Add your domain here
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
  },
  reactStrictMode: true,
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add any custom webpack configurations here
    return config;
  },
  // API route configurations should be handled in route.ts files in the app directory
  ...(userConfig?.default || {})
};

export default nextConfig;

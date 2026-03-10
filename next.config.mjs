/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Optimize webpack cache for handling large strings
    // Use Buffer serialization instead of direct string serialization
    if (config.cache) {
      config.cache.managedPaths = []
      config.cache.buildDependencies = {
        config: [],
      }
    }
    return config
  },
}

export default nextConfig

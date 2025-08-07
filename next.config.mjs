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
  // Add output configuration for Vercel
  output: 'standalone',
  // Ensure proper static generation
  trailingSlash: false,
  // Handle potential build issues
  experimental: {
    // Enable app directory features
    appDir: true,
  },
  // Ensure proper routing
  async redirects() {
    return []
  },
  async rewrites() {
    return []
  }
}

export default nextConfig

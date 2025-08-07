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
  // Remove output: 'standalone' as it can cause issues
  // Remove experimental.appDir as it's no longer needed in Next.js 15
  trailingSlash: false,
}

export default nextConfig

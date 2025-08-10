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
  experimental: {
    // Improve hydration performance
    optimizePackageImports: ['@/components/ui'],
  },
  // Suppress hydration warnings for known browser extension issues
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        // Allow this route family to be embedded in iframes on external sites
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          // Use a permissive frame-ancestors for the embed page only
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
        ],
      },
    ]
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const shouldStaticExport = process.env.NEXT_STATIC_EXPORT === 'true'

const nextConfig = {
  output: shouldStaticExport ? 'export' : undefined,
  trailingSlash: shouldStaticExport,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

module.exports = nextConfig


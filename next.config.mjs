/** @type {import('next').NextConfig} */
const shouldStaticExport = process.env.NEXT_STATIC_EXPORT === 'true'

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  output: shouldStaticExport ? 'export' : undefined,
  trailingSlash: shouldStaticExport,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;

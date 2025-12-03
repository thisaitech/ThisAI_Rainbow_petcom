/** @type {import('next').NextConfig} */
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
  // Ensure we're not using static export
  // output: 'export', // Commented out - we want dynamic rendering
};

export default nextConfig;

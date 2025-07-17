/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['qwpxsufrgigpjcxtnery.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qwpxsufrgigpjcxtnery.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/team-logos/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

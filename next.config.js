/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qwpxsufrgigpjcxtnery.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/team-logos/**',
      },
      {
        protocol: 'https',
        hostname: 'qwpxsufrgigpjcxtnery.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/player-avatars/**',
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

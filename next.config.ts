import { withWorkflow } from 'workflow/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'othntbcrtmemavfsslrb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  eslint: {
    // Enforce ESLint errors in production builds.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enforce TypeScript errors in production builds.
    ignoreBuildErrors: false,
  },
};

export default withWorkflow(nextConfig);

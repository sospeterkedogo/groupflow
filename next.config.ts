import { withWorkflow } from 'workflow/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,


  experimental: {},

  // ── Image optimisation ───────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: 'othntbcrtmemavfsslrb.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // ── HTTP response caching ────────────────────────────────────────────────
  // API routes that are safe to cache at the CDN edge
  async headers() {
    return [
      {
        source: '/api/health',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=10, stale-while-revalidate=30' }],
      },
      {
        source: '/api/product/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' }],
      },
      // Service worker — never cache at CDN so updates propagate immediately
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ]
  },

  // ── Webpack: tree-shake lucide-react (massive bundle reduction) ──────────
  webpack(config, { isServer }) {
    if (!isServer) {
      // Replace heavy packages with lighter alternatives where possible
      config.resolve.alias = {
        ...config.resolve.alias,
      }
    }
    return config
  },

  typescript: { ignoreBuildErrors: false },
}

export default withWorkflow(nextConfig, { workflows: { lazyDiscovery: true } })


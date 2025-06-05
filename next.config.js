/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'partners.airalo.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'hptbhujyrhjsquckzckc.supabase.co',
        pathname: '/**',
      },
    ],
    domains: ['hptbhujyrhjsquckzckc.supabase.co'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/create-airalo-order',
        destination: '/api/create-airalo-order',
      },
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig 
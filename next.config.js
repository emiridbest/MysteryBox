/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false
    }
    return config
  }
}

module.exports = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts'],
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', 'https://esusu-farcaster.vercel.app', 'https://concentrations-sister-childhood-bi.trycloudflare.com']
};
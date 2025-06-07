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
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', 'https://celomysterybox.vercel.app', 'https://val-mortgage-michael-successfully.trycloudflare.com/_next/webpack-hmr']
};
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost']
    }
  },
  env: {
    CLAUDE_PREFS_VERSION: process.env.npm_package_version
  }
}

module.exports = nextConfig
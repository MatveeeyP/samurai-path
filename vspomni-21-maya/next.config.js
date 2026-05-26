/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  // Pin the Turbopack workspace root to this project directory so Next.js
  // doesn't walk up to a parent lockfile and mis-detect the root.
  turbopack: {
    root: path.resolve(__dirname),
  },
}

module.exports = nextConfig

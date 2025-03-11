/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disable strict mode to help with hydration
  poweredByHeader: false,
  swcMinify: true,
};

module.exports = nextConfig;

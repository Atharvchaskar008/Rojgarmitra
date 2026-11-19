/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rojgarmitra/shared', '@rojgarmitra/i18n'],
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb'
    }
  }
};

export default nextConfig;

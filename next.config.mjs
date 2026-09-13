/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "puppeteer",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/apt-start-avix-admin',
        destination: '/admin',
      },
      {
        source: '/apt-start-avix-admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
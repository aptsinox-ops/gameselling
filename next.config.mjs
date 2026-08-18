/** @type {import('next').NextNextConfig} */
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
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apis.rrrtopup.com',
      },
    ],
  },
};

export default nextConfig;
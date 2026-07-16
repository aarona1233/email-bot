/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  allowedDevOrigins: ["169.254.83.107"],  // ← replace with YOUR current IP
};

module.exports = nextConfig;
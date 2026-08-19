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
  allowedDevOrigins: [
    "169.254.83.107",      // normal WiFi IP
    "100.127.48.117", 
    "10.2.0.2:3000",      
  ],
};

module.exports = nextConfig;
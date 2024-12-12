// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: "/api/:path*", // Matchar alla API-anrop som börjar med /api
          destination: "http://localhost:3001/api/:path*", // Backend-serverns URL
        },
      ];
    },
  };
  
  export default nextConfig;
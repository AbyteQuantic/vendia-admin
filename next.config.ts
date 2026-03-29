import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8089";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/ping",
        destination: `${backendUrl}/ping`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const backendAPI = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api");
const backendProtocol = backendAPI.protocol.replace(":", "") as "http" | "https";
const allowLocalBackendImages = ["localhost", "127.0.0.1"].includes(backendAPI.hostname);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: allowLocalBackendImages,
    remotePatterns: [
      { protocol: backendProtocol, hostname: backendAPI.hostname, port: backendAPI.port, pathname: "/api/media/file/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

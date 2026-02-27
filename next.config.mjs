/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  /* Allow images from Vercel Blob and other services */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
      },
      // Keep existing patterns for Unsplash, etc.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;

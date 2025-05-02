/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "via.placeholder.com",
      "oaidalleapiprodscus.blob.core.windows.net", // For OpenAI DALL-E images
      "replicate.delivery" // For Replicate AI images
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use SWC compiler instead of Babel
  swcMinify: true,
  experimental: {
    // These experimental features may help with the private class fields issue
    serverComponentsExternalPackages: ['undici'],
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;

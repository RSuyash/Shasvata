const nextConfig = {
  transpilePackages: ["@shasvata/ui", "@shasvata/content"],
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    externalDir: true
  }
};

export default nextConfig;

const nextConfig = {
  transpilePackages: ["@shasvata/ui"],
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    externalDir: true
  }
};

export default nextConfig;

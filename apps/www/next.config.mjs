const nextConfig = {
  transpilePackages: ["@shasvata/ui", "@shasvata/tokens"],
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    externalDir: true
  }
};

export default nextConfig;

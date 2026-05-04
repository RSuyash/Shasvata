const nextConfig = {
  transpilePackages: ["@shasvata/ui", "@shasvata/charts", "@shasvata/schemas", "@shasvata/types"],
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    externalDir: true
  }
};

export default nextConfig;

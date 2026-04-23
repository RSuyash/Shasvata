const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://sdk.cashfree.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.shasvata.com https://app.shasvata.com https://accounts.google.com https://oauth2.googleapis.com https://apis.google.com https://sdk.cashfree.com https://payments.cashfree.com https://sandbox.cashfree.com https://api.cashfree.com",
  "frame-src 'self' https://accounts.google.com https://sdk.cashfree.com https://payments.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com",
  "form-action 'self' https://payments.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  basePath: "/app",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/projects",
        destination: "/dashboard/projects",
        permanent: true,
      },
      {
        source: "/projects/:path*",
        destination: "/dashboard/projects/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/admin', destination: '/admin/index.html' },
      { source: '/admin/', destination: '/admin/index.html' },
      { source: '/admin/:path*', destination: '/admin/index.html' },
    ];
  },
};

export default nextConfig;

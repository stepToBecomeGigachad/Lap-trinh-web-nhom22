/** @type {import('next').NextConfig} */
const apiProxyUrl = process.env.API_PROXY_URL;

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const rules = [
      { source: '/admin', destination: '/admin/index.html' },
      { source: '/admin/', destination: '/admin/index.html' },
      { source: '/admin/:path*', destination: '/admin/index.html' },
    ];

    if (apiProxyUrl) {
      const trimmed = apiProxyUrl.replace(/\/+$/, '');
      rules.unshift({ source: '/api/:path*', destination: `${trimmed}/api/:path*` });
    }

    return rules;
  },
};

export default nextConfig;

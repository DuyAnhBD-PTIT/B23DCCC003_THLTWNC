/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: []
  },
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/nextjs-registry',
    'rc-util',
    'rc-pagination',
    'rc-picker'
  ]
};

export default nextConfig;

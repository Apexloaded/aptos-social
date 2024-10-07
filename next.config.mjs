/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = ['sharp', ...config.externals];
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    path: '/_next/image',
    loader: 'default',
    disableStaticImages: false,
    minimumCacheTTL: 60,
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.irys.xyz',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'aptos-names-api-a4ocin5yba-uw.a.run.app',
        pathname: '**',
      },
    ],
  },
  experimental: {
    scrollRestoration: true,
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['mongoose'],
    instrumentationHook: true,
  },
};
export default nextConfig;

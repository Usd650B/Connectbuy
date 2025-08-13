
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Remove output: 'export' to enable SSR
  // distDir: 'out', // Keep this if you want to customize the build directory
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;

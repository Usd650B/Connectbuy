
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable static HTML export for Firebase Hosting
  output: 'export',
  
  // Optional: Change the output directory to 'out' to match Firebase config
  distDir: 'out',
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true, // Set to false in production
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true, // Set to false in production
  },
  
  // Image optimization configuration
  images: {
    unoptimized: true, // Required for static exports
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
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;

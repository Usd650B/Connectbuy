// This is a minimal Next.js config for the Cloud Functions environment
module.exports = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Disable static exports since we're using SSR
  output: 'standalone',
  
  // Configure images
  images: {
    // Add your image domains here
    domains: ['placehold.co', 'firebasestorage.googleapis.com'],
  },
  
  // Environment variables
  env: {
    // Add any environment variables needed on the server
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
};

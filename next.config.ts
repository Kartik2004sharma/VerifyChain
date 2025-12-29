import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for faster development
  reactStrictMode: false, // Disable in dev for faster renders
  
  // Add external packages that need to be transpiled for better SSR support
  transpilePackages: ['@rainbow-me/rainbowkit', 'wagmi', '@tanstack/react-query'],
  
  // Optimize webpack/turbopack for faster compilation
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      'recharts',
    ],
    // Enable concurrent features for better performance
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Reduce memory usage
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize module resolution
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };
    
    return config;
  },
};

// Allow opting into Turbopack by removing the custom webpack hook at runtime.
// Some projects need the custom `webpack` hook (fallbacks, specific optimizations).
// Turbopack can't run when a custom webpack config is present, so we make this
// opt-in via the environment variable `NEXT_USE_TURBOPACK=1`.
// See: https://nextjs.org/docs/app/api-reference/next-config-js/turbo
if (process.env.NEXT_USE_TURBOPACK === '1') {
  // Remove the custom webpack handler so Next.js can choose Turbopack in dev.
  // Keep the rest of the config intact.
  // NOTE: If your app relied on the webpack fallbacks (fs/net/tls), you may
  // need to handle incompatibilities or conditionally polyfill them elsewhere.
  // This change is intentionally non-destructive by default.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete nextConfig.webpack;
  // Optionally surface a small console hint when running locally
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('NEXT_USE_TURBOPACK=1 detected — removed custom webpack config to allow Turbopack');
  }
}

export default nextConfig;

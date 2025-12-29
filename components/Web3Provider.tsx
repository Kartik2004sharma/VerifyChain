'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from '@/lib/wagmi-config';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Create QueryClient with SSR-friendly settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent queries from running on server
      enabled: typeof window !== 'undefined',
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
      // Suppress errors in console
      throwOnError: false,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* Show children but with hydration-safe wrapper */}
          <div suppressHydrationWarning>
            {mounted ? children : <div className="min-h-screen bg-black">{children}</div>}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

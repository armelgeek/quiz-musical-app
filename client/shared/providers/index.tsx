'use client';

import KBar from '@/shared/components/atoms/ui/kbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { AuthProvider } from './auth-provider';

interface ProviderProps {
  readonly children: React.ReactNode;
}

const queryClient = new QueryClient();

export function Provider({ children }: ProviderProps) {
  return (
    <KBar>
      <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
              <NuqsAdapter>{children}</NuqsAdapter>
              <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </KBar>
  );
}

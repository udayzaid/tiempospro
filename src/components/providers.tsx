'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LiveHubProvider } from '@/context/LiveHubContext';

// Equivale a los providers que envolvían el <Stack> en app/_layout.tsx de Expo.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LiveHubProvider>{children}</LiveHubProvider>
    </AuthProvider>
  );
}

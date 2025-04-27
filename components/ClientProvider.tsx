// components/ClientProvider.tsx
'use client';

import { AuthProvider } from '../context/AuthContext';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
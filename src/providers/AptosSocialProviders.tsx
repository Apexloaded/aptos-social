'use client';

import { AuthProvider } from '@/context/auth.context';
import { PropsWithChildren } from 'react';

export function AptosSocialProviders({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}

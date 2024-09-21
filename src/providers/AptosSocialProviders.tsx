'use client';

import { AccountProvider } from '@/context/account.context';
import { AuthProvider } from '@/context/auth.context';
import { PropsWithChildren } from 'react';

export function AptosSocialProviders({ children }: PropsWithChildren) {
  return (
    <AccountProvider>
      <AuthProvider>{children}</AuthProvider>
    </AccountProvider>
  );
}

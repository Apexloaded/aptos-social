'use client';

import { AccountProvider } from '@/context/account.context';
import { AuthProvider } from '@/context/auth.context';
import { AlertModalProvider } from '@/context/modal.context';
import { PropsWithChildren } from 'react';

export function AptosSocialProviders({ children }: PropsWithChildren) {
  return (
    <AlertModalProvider>
      <AccountProvider>
        <AuthProvider>{children}</AuthProvider>
      </AccountProvider>
    </AlertModalProvider>
  );
}

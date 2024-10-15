'use client';

import React from 'react';
import { AptosSocialLogo } from '@/components/Icons/Icons';
import { ListConnectors } from '@/components/Auth/ListConnectors';

export default function Login() {
  return (
    <div className="px-5 bg-primary/5 h-svh">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center pt-10">
          <AptosSocialLogo />
        </div>
        <div className="text-center py-4 mb-5">
          <p className="text-2xl font-semibold dark:text-white">
            Connect your wallet
          </p>
          <p className="text-medium dark:text-white">
            Seamlessly signup or login to your account using your favourite
            wallet
          </p>
        </div>
        <ListConnectors />
      </div>
    </div>
  );
}

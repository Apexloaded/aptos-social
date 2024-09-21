'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AptosSocialLogo } from '@/components/Icons/Icons';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    console.log(hashParams);
    const token = hashParams.get('id_token');

    if (token) {
      if (window.opener) {
        // Send the token to the parent window
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_SUCCESS', token },
          window.location.origin
        );
      } else {
        // If opened directly (not in a popup), redirect to the home page or handle the token
        router.push('/');
      }
    }
  }, [router]);

  return (
    <div className="px-5 bg-primary/5 h-svh">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center pt-10">
          <AptosSocialLogo />
        </div>
        <div className="text-center py-4 mb-5">
          <p className="text-2xl font-semibold">Connect your wallet</p>
          <p className="text-medium">
            Seamlessly signup or login to your account using your favourite
            wallet
          </p>
        </div>
      </div>
    </div>
  );
}

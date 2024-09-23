'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogo } from '@/components/Icons/Icons';
import { Connector } from '../Connector';
import { GOOGLE_CLIENT_ID } from '@/config/constants';
import { routes } from '@/routes';
import useEphemeral from '@/hooks/ephemeral.hook';
import useToast from '@/hooks/toast.hook';
import { useAccount } from '@/context/account.context';
import { findAuth, loginAuth, registerAuth } from '@/actions/auth.action';

const POPUP_WIDTH = 400;
const POPUP_HEIGHT = 600;

export default function GoogleConnect() {
  const router = useRouter();
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const { error, loading, updateLoading, success } = useToast();
  const { createAccount } = useAccount();
  const { generateKeyPair, getKeyPair } = useEphemeral();

  useEffect(() => {
    router.prefetch(routes.app.home);
    router.prefetch(routes.app.welcome);
  }, [router]);

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.screen.width,
        height: window.screen.height,
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const handleGoogleAuth = async (
    jwt: string,
    ephemeralKeyPair: { nonce: string }
  ) => {
    const { nonce, email, email_verified } = jwtDecode<{
      nonce: string;
      email: string;
      email_verified: boolean;
    }>(jwt);

    if (nonce !== ephemeralKeyPair.nonce) {
      throw new Error('Received invalid nonce from Google');
    }

    const ekp = getKeyPair(nonce);
    if (!ekp) {
      throw new Error('Failed to retrieve ephemeral key pair');
    }

    const authRes = await findAuth({ email: email.toLowerCase() });

    if (authRes.status && authRes.message == 'success') {
      updateLoading({ msg: 'Logging in...' });
      const [login, keyless] = await Promise.all([
        loginAuth(email),
        createAccount(jwt, ekp),
      ]);
      if (login.status && keyless) {
        success({ msg: 'Successfully signed in!' });
        router.push(routes.app.home);
      }
    } else {
      updateLoading({ msg: 'Creating account...' });
      const account = await createAccount(jwt, ekp);
      const response = await registerAuth({
        email,
        isEmailVerified: email_verified,
        address: account.accountAddress.toString(),
      });
      if (response.status) {
        success({ msg: 'Successfully signed up!' });
        router.push(routes.app.home);
      }
    }
  };

  const openGoogleAuthPopup = () => {
    const ephemeralKeyPair = generateKeyPair();
    if (!ephemeralKeyPair) return;

    loading({ msg: 'Authenticating...' });

    const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const searchParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: ephemeralKeyPair.nonce,
    });
    redirectUrl.search = searchParams.toString();

    const popupLeft = (screenSize.width - POPUP_WIDTH) / 2;
    const popupTop = (screenSize.height - POPUP_HEIGHT) / 2;

    const popup = window.open(
      redirectUrl,
      'popup',
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${popupTop},left=${popupLeft},popup=true`
    );

    if (popup) {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          popup.close();
          window.removeEventListener('message', handleMessage);

          try {
            await handleGoogleAuth(event.data.token, ephemeralKeyPair);
          } catch (err) {
            error({
              msg: err instanceof Error ? err.message : 'An error occurred',
            });
          }
        }
      };

      window.addEventListener('message', handleMessage);
    }
  };

  return (
    <Connector
      connector={{
        id: 'google-connect',
        name: 'Sign in with Google',
        icon: GoogleLogo,
        onClick: openGoogleAuthPopup,
      }}
    />
  );
}

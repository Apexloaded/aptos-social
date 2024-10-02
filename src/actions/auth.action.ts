'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { AccountInfo } from '@aptos-labs/wallet-adapter-react';
import { getApi, postApi } from './api.action';
import { IActionResponse } from '@/interfaces/response.interface';
import { routes } from '@/routes';
import { walletToLowercase } from '@/utils/helpers';
import { IAuth, Auth } from '@/models/auth.model';
import { createSession, deleteSession } from '@/lib/session';
import { Sessions } from '@/config/session.enum';
import { FilterQuery } from 'mongoose';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export async function registerAuth(payload: IAuth): Promise<IActionResponse> {
  try {
    const user = await Auth.findOne({ email: payload.email });
    if (user) {
      return {
        status: false,
        message: 'duplicate',
      };
    }

    const newUser = await Auth.create(payload);
    await createSession(
      {
        email: newUser.email,
        onboardingCompleted: newUser.isOnboardingCompleted,
      },
      Sessions.AuthSession
    );

    const serializedUser = {
      id: newUser._id.toString(),
      email: newUser.email,
      isOnboardingCompleted: newUser.isOnboardingCompleted,
    };

    return {
      status: true,
      message: 'User registered successfully',
      data: serializedUser,
    };
  } catch (error: any) {
    return {
      status: false,
      message: `${error.message}` || 'Error registering user',
    };
  }
}

export async function loginAuth(email: string): Promise<IActionResponse> {
  const user = await Auth.findOne({ email: email.toLowerCase() });
  if (!user) {
    return {
      status: false,
      message: 'No user registered',
    };
  }

  await createSession(
    {
      email: user.email,
      onboardingCompleted: user.isOnboardingCompleted,
    },
    Sessions.AuthSession
  );

  return {
    status: true,
    message: 'Logged in successfully',
    data: user,
  };
}

export async function findAuth(
  filter: FilterQuery<IAuth>
): Promise<IActionResponse> {
  try {
    const user = await Auth.findOne(filter);
    if (!user) return { status: false, message: 'User not found' };
    return { status: true, message: 'success', data: user };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
}

export async function getNonce(wallet: string): Promise<IActionResponse> {
  try {
    const response = await getApi(`auth/generate-nonce?wallet=${wallet}`);
    console.log(response);
    if (response && response.nonce) {
      return {
        status: true,
        message: 'success',
        data: { nonce: response.nonce },
      };
    }
    return { status: false, message: 'false' || response.error };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
}

export async function updateAuth(
  filter: FilterQuery<IAuth>,
  payload: Partial<IAuth>
): Promise<IActionResponse> {
  try {
    const user = await Auth.updateOne(filter, payload);
    return {
      status: true,
      message: 'success',
    };
  } catch (err) {
    return {
      status: false,
      message: 'error updating user',
    };
  }
}

export async function completeOnboarding(
  address: string
): Promise<IActionResponse> {
  try {
    await Auth.updateOne(
      {
        address: walletToLowercase(address),
      },
      {
        isOnboardingCompleted: true,
      }
    );
    await createSession(
      {
        id: address,
        onboardingCompleted: true,
      },
      Sessions.AuthSession
    );
    return { status: true, message: 'Onboarding completed!' };
  } catch (error: any) {
    console.log(error);
    return { status: false, message: `${error.message}` };
  }
}

export async function isAuthenticated() {
  const cookie = cookies().get(Sessions.AuthSession)?.value;

  if (!cookie) {
    return false;
  }

  try {
    const parsedCookie: any = jwtDecode(cookie);
    const expires = new Date(parsedCookie.exp * 1000);
    if (expires < new Date()) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function authenticate(account: AccountInfo, nonce: string) {
  try {
    const res = await signIn('credentials', {
      address: account.address,
      publicKey: account.publicKey,
      nonce,
      redirect: false,
    });
    return { status: false, message: 'false' };
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    return { status: false, message: `${error.message}` };
  }
}

export async function initSignOut() {
  deleteSession(Sessions.AuthSession);
  await signOut({ redirect: true, redirectTo: routes.login });
}

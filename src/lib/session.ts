import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session');
  }
}

export async function createSession(payload: any, name: string) {
  console.log('payload', payload);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ ...payload, expiresAt });
  //     httpOnly: false,
  //     path: "/",
  //     sameSite: "strict",
  //     secure: false,
  //     maxAge: 6 * 24 * 60 * 60,
  cookies().set(name, session, {
    httpOnly: false,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    maxAge: 6 * 24 * 60 * 60,
  });
}

export function deleteSession(name: string) {
  cookies().delete(name);
}
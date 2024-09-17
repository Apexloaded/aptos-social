import type { NextAuthConfig } from 'next-auth';
import { protectedRoutes, publicRoutes } from './routes';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log(auth);
      const isLoggedIn = !!auth?.user;

      const path = nextUrl.pathname;
      console.log(nextUrl.pathname);
      const isProtectedRoute =
        protectedRoutes.includes(path) ||
        (/^\/[^/]+$/.test(path) && !publicRoutes.includes(path));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/feeds', nextUrl));
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

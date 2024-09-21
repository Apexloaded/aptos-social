import type { NextAuthConfig } from 'next-auth';
import { protectedRoutes, publicRoutes } from './routes';
import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { Sessions } from './config/session.enum';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async authorized({ request: { nextUrl, cookies } }) {
      const token = cookies.get(Sessions.AuthSession)?.value;

      const path = nextUrl.pathname;
      const isAuthPage = path === '/auth/login';
      const isOnboardingPage = path === '/welcome';
      const isProtectedRoute =
        protectedRoutes.includes(path) ||
        (/^\/[^/]+$/.test(path) && !publicRoutes.includes(path));

      if (token) {
        try {
          const decodedToken = jwtDecode(token) as {
            onboardingCompleted?: boolean;
          };
          const onboardingCompleted = decodedToken.onboardingCompleted;

          if (isOnboardingPage && onboardingCompleted) {
            return NextResponse.redirect(new URL('/feeds', nextUrl));
          }

          if (isProtectedRoute) {
            if (!onboardingCompleted && !isOnboardingPage) {
              return NextResponse.redirect(new URL('/welcome', nextUrl));
            }
            return true;
          }

          if (isAuthPage) {
            return NextResponse.redirect(new URL('/feeds', nextUrl));
          }

          if (!onboardingCompleted && !isOnboardingPage) {
            return NextResponse.redirect(new URL('/welcome', nextUrl));
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          return false;
        }
      } else if (isProtectedRoute) {
        return false;
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

declare module 'next-auth' {
  interface User {
    onboardingCompleted: boolean;
  }
}

// import type { NextAuthConfig } from 'next-auth';
// import { protectedRoutes, publicRoutes } from './routes';
// import { NextResponse } from 'next/server';

// export const authConfig = {
//   pages: {
//     signIn: '/login',
//   },
//   callbacks: {
//     async authorized({ auth, request: { nextUrl, cookies } }) {
//       const isLoggedIn = !!auth?.user;

//       const token = cookies.get('auth-user')?.value;

//       const path = nextUrl.pathname;
//       const isAuthPage = path === '/login';
//       const isOnboardingPage = path === '/welcome';
//       const isProtectedRoute =
//         protectedRoutes.includes(path) ||
//         (/^\/[^/]+$/.test(path) && !publicRoutes.includes(path));

//       if (isProtectedRoute) {
//         if (!isLoggedIn) return false;

//         const onboardingCompleted = auth.user?.onboardingCompleted;
//         if (!onboardingCompleted && !isOnboardingPage) {
//           return NextResponse.redirect(new URL('/welcome', nextUrl));
//         }

//         return true;
//       } else if (isLoggedIn) {
//         if (isAuthPage) {
//           return NextResponse.redirect(new URL('/feeds', nextUrl));
//         }
//         if (!auth.user?.onboardingCompleted && !isOnboardingPage) {
//           return NextResponse.redirect(new URL('/welcome', nextUrl));
//         }
//       }
//       return true;
//     },
//     async redirect({ url, baseUrl }) {
//       if (url.startsWith('/')) return `${baseUrl}${url}`;
//       else if (new URL(url).origin === baseUrl) return url;
//       return baseUrl;
//     },
//   },
//   providers: [],
// } satisfies NextAuthConfig;

// declare module 'next-auth' {
//   interface User {
//     onboardingCompleted: boolean;
//   }
// }

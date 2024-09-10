import type { NextAuthConfig } from "next-auth";
import { protectedRoutes, publicRoutes } from "./routes";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log(auth);
      const isLoggedIn = !!auth?.user;

      const path = nextUrl.pathname;
      const isProtectedRoute = protectedRoutes.includes(path);

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/feeds", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

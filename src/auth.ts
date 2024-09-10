import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { getUser } from "./actions/user.action";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        publicKey: { label: "Username" },
        address: { label: "Address" },
        nonce: { label: "Nonce" },
      },
      async authorize(credentials) {
        const { publicKey, address, nonce } = credentials;
        const user = await getUser(address as unknown as string);
        if (!user.status) return null;
        if (user.data.nonce !== nonce) return null;
        return {
          ...user.data,
        };
      },
    }),
  ],
});

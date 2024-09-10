"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { AccountInfo } from "@aptos-labs/wallet-adapter-react";
import { getApi, postApi } from "./api.action";
import { IActionResponse } from "@/interfaces/response.interface";

export async function getNonce(wallet: string): Promise<IActionResponse> {
  try {
    const response = await getApi(`auth/generate-nonce?wallet=${wallet}`);
    if (response && response.nonce) {
      return {
        status: true,
        message: "success",
        data: { nonce: response.nonce },
      };
    }
    return { status: false, message: "false" || response.error };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
}

export async function authenticate(account: AccountInfo, nonce: string) {
  try {
    await signIn("credentials", {
      address: account.address,
      publicKey: account.publicKey,
      nonce,
    });
    // const data = response.data as AuthData;
    // if (data.ok) {
    //   setCookie(null, StorageTypes.ACCESS_TOKEN, data.token, {
    //     httpOnly: false,
    //     path: "/",
    //     sameSite: "strict",
    //     secure: false,
    //     maxAge: 6 * 24 * 60 * 60,
    //   });
    //   return { status: true, message: "success", data };
    // }
    return { status: false, message: "false" };
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    return { status: false, message: `${error.message}` };
  }
}

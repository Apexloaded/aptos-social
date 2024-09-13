import { aptosClient } from "@/utils/aptosClient";
import { prisma } from "@/utils/db";
import { walletToLowercase } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";
import { generateNonce } from "siwe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("Hello server");
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("wallet");

    console.log("Wallet address: " + address);
    if (!address) {
      throw new Error("Missing or invalid address");
    }

    // const accountInfo = await aptosClient().account.getAccountInfo({
    //   accountAddress: address,
    // });
    // console.log(accountInfo);
    // if (!accountInfo) {
    //   throw new Error("Account not found");
    // }

    const auth = await prisma.auth.findUnique({
      where: {
        signer: walletToLowercase(address),
      },
    });

    console.log("auth", auth);
    if (!auth) {
      // Register the account
      const newNonce = generateNonce();
      const newAuth = await prisma.auth.create({
        data: { nonce: newNonce, signer: walletToLowercase(address) },
      });
      return NextResponse.json({ nonce: newAuth.nonce });
    }

    return NextResponse.json({ nonce: auth.nonce });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}

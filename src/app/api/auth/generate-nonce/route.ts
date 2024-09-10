import { aptosClient } from "@/utils/aptosClient";
import { prisma } from "@/utils/db";
import { walletToLowercase } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";
import { generateNonce } from "siwe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("wallet");

    if (!address) {
      throw new Error("Missing or invalid address");
    }

    const accountInfo = await aptosClient().account.getAccountInfo({
      accountAddress: address,
    });
    if (!accountInfo) {
      throw new Error("Account not found");
    }

    const auth = await prisma.auth.findUnique({
      where: {
        signer: walletToLowercase(address),
      },
    });

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
    return NextResponse.json({ error });
  }
}

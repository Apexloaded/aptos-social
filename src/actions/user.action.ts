"use server";

import { prisma } from "@/utils/db";
import { IActionResponse } from "@/interfaces/response.interface";
import { walletToLowercase } from "@/utils/helpers";

export async function getUser(address: string): Promise<IActionResponse> {
  try {
    const user = await prisma.auth.findUnique({
      where: {
        signer: walletToLowercase(address),
      },
    });
    if (!user) return { status: false, message: "User not found" };
    return { status: true, message: "success", data: user };
  } catch (error: any) {
    return { status: false, message: `${error.message}` };
  }
}

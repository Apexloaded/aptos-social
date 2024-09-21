import Auth from '@/models/auth.model';
import { walletToLowercase } from '@/utils/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from 'siwe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('Hello server');
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('wallet');

    console.log('Wallet address: ' + address);
    if (!address) {
      throw new Error('Missing or invalid address');
    }

    // const accountInfo = await aptosClient().account.getAccountInfo({
    //   accountAddress: address,
    // });
    // console.log(accountInfo);
    // if (!accountInfo) {
    //   throw new Error("Account not found");
    // }

    const auth = await Auth.findOne({
      signer: walletToLowercase(address),
    });

    let response;
    if (!auth) {
      // Register the account
      const newNonce = generateNonce();
      const newAuth = await Auth.create({
        nonce: newNonce,
        signer: walletToLowercase(address),
      });
      response = NextResponse.json({ nonce: newAuth.nonce });
    } else {
      // Authenticate the account
      response = NextResponse.json({ nonce: auth.nonce });
    }
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}

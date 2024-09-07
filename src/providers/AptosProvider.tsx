"use client";

import { NETWORK } from "@/config/constants";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export function AptosWalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK }}
      onError={(error) => {
        alert(error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

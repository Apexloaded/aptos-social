"use client";

import { NETWORK } from "@/config/constants";
import useToast from "@/hooks/toast.hook";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";

export function AptosWalletProvider({ children }: PropsWithChildren) {
  const { error } = useToast();
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK }}
      onError={(err) => {
        error({ msg: err || "Error connecting to wallet" });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

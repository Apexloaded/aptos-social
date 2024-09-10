"use client";

import React, { useEffect, useState } from "react";
import { AptosSocialLogo } from "@/components/Icons/Icons";
import { ListConnectors } from "@/components/Auth/ListConnectors";
import SignInModal from "@/components/Auth/Signature";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Login() {
  const [signModal, setSignModal] = useState<boolean>(false);
  const { connected, account } = useWallet();

  useEffect(() => {
    async function iniModal() {
      if (connected && account) {
        setSignModal(true);
      }
    }
    iniModal();
  }, [connected, account]);

  return (
    <div className="px-5 bg-primary/5 h-svh">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center pt-10">
          <AptosSocialLogo />
        </div>
        <div className="text-center py-4 mb-5">
          <p className="text-2xl font-semibold">Connect your wallet</p>
          <p className="text-medium">
            Seamlessly signup or login to your account using your favourite
            wallet
          </p>
        </div>
        <ListConnectors isOpen={signModal} setIsOpen={setSignModal} />
      </div>
    </div>
  );
}

"use client";

import {
  groupAndSortWallets,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Connector } from "./Connector";
import CreateSmartWallet from "./CreateSmartWallet";
import SignInModal from "./Signature";
import { useEffect, useState } from "react";
import SignModal from "./SignModal";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export function ListConnectors({ isOpen, setIsOpen }: Props) {
  const [signModal, setSignModal] = useState<boolean>(false);
  const { account, connected, disconnect, wallets = [], connect } = useWallet();
  const { aptosConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets(wallets);
  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      {connected ? (
        <SignModal isOpen={isOpen} setIsOpen={setIsOpen} />
      ) : (
        <>
          <div className="flex flex-col border border-primary/50 rounded-lg overflow-hidden">
            {availableWallets.map((wallet) => (
              <Connector
                key={wallet.name}
                wallet={wallet}
                openModal={openModal}
              />
            ))}
          </div>
          {hasAptosConnectWallets && (
            <div className="flex flex-col gap-2 pt-3">
              {aptosConnectWallets.map((wallet, i) => (
                <CreateSmartWallet key={i} wallet={wallet} />
              ))}
            </div>
          )}
        </>
      )}

      {/* <SignInModal isOpen={isOpen} setIsOpen={setIsOpen} /> */}
    </>
  );
}

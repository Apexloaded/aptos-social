import React from "react";
import { AnyAptosWallet, WalletItem } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui/button";

interface Props {
  wallet: AnyAptosWallet;
  onConnect?: () => void;
}
function CreateSmartWallet({ wallet, onConnect }: Props) {
  return (
    <div>
      <div className="flex flex-row py-5 gap-x-2 justify-center items-center">
        <div className="h-[0.08rem] w-20 bg-medium"></div>
        <div className="text-medium text-sm flex items-center justify-center">
          <p>Don&apos;t have a wallet?</p>
        </div>
        <div className="h-[0.08rem] w-20 bg-medium"></div>
      </div>
      <div className="flex justify-center">
        <WalletItem wallet={wallet} onConnect={onConnect}>
          <WalletItem.ConnectButton asChild>
            <Button size="lg" variant="default" className="w-full gap-4">
              <WalletItem.Icon className="h-5 w-5 bg-white rounded-full" />
              <p className="text-base">Create smart wallet</p>
            </Button>
          </WalletItem.ConnectButton>
        </WalletItem>
      </div>
    </div>
  );
}

export default CreateSmartWallet;

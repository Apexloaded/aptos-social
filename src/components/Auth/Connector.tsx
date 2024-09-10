import {
  AnyAptosWallet,
  isInstallRequired,
  useWallet,
  WalletItem,
} from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui/button";

interface ConnectorProps {
  wallet: AnyAptosWallet;
  onConnect?: () => void;
  openModal: () => void;
}
export function Connector({ wallet, onConnect, openModal }: ConnectorProps) {
  const { connected } = useWallet();

  return (
    <WalletItem
      wallet={wallet}
      onConnect={openModal}
      className="flex items-center justify-between px-4 py-3 gap-4 border-b border-primary/50 last-of-type:border-b-0"
    >
      <WalletItem.ConnectButton asChild>
        <div
          role="button"
          className="flex items-center w-full gap-4"
        >
          <div className="flex-1 items-center flex gap-4">
            <WalletItem.Icon className="h-6 w-6" />
            <WalletItem.Name className="text-base font-normal" />
          </div>
          {isInstallRequired(wallet) && (
            <Button size="sm" variant="ghost" asChild>
              <WalletItem.InstallLink />
            </Button>
          )}
        </div>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

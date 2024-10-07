import { useAccount } from '@/context/account.context';
import { useAlertModal } from '@/context/modal.context';
import useToast from '@/hooks/toast.hook';
import { INFT } from '@/interfaces/feed.interface';
import { aptosClient } from '@/utils/aptosClient';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { FlameIcon } from 'lucide-react';

type Props = {
  nft: INFT;
};
export default function BurnButton({ nft }: Props) {
  const { openModal } = useAlertModal();
  const { account } = useAccount();
  const { loading, error, success } = useToast();

  const onBurn = async () => {
    try {
      if (!account) return;
      loading({ msg: 'Burning...' });
      const transferTransaction =
        await aptosClient().transferDigitalAssetTransaction({
          sender: account,
          digitalAssetAddress: `${nft.current_token_data?.token_data_id}`,
          recipient: '0x1' as unknown as AccountAddress,
        });
      const committedTxn = await aptosClient().signAndSubmitTransaction({
        signer: account,
        transaction: transferTransaction,
      });
      const pendingTxn = await aptosClient().waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      if (pendingTxn.success) {
        success({ msg: 'NFT burned successfully!' });
      }
    } catch (err: any) {
      error({ msg: err.message || 'Error burning item' });
    }
  };

  const onClick = () => {
    openModal({
      title: 'Burn this NFT?',
      message:
        'Are you sure you want to burn this NFT? This action cannot be undone.',
      confirmText: 'Burn NFT',
      cancelText: 'Cancel',
      onConfirm: onBurn,
      onCancel: () => {
        console.log('Action cancelled');
      },
    });
  };

  return (
    <div
      onClick={onClick}
      role="button"
      className="py-2 px-3 hover:bg-secondary dark:hover:bg-dark dark:text-white flex items-center gap-3"
    >
      <FlameIcon className="text-danger" size={20} />
      <p className="text-danger">Burn</p>
    </div>
  );
}

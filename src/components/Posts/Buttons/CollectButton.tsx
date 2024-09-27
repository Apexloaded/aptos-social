import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Grid2x2PlusIcon } from 'lucide-react';
import { ButtonProps } from '../PostButtons';
import useToast from '@/hooks/toast.hook';
import { useAccount } from '@/context/account.context';
import { collectPost } from '@/aptos/entry/feeds.entry';
import { aptosClient } from '@/utils/aptosClient';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';

function CollectButton({ post }: ButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address, signAndSubmitTransaction } = useAccount();
  const { loading, error, success, updateLoading } = useToast();

  const handleCollect = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      loading({ msg: 'Initiating collection' });
      setIsLoading(true);
      const tx = collectPost(post.id);
      console.log(tx);
      const response = await signAndSubmitTransaction(tx);

      if (response) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        if (!committedTransactionResponse.success) {
          setIsLoading(false);
        } else {
          setIsLoading(false);
          // Invalidate cache to get fresh data
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.Posts, address],
          });
          success({ msg: 'Post collected successfully' });
        }
      }
    } catch (err) {
      console.log(err);
      error({ msg: 'Error collecting post' });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      type="button"
      onClick={handleCollect}
      disabled={isLoading}
      size="sm"
      variant="default"
      className="rounded-full"
    >
      <Grid2x2PlusIcon size={16} />
      <p>Collect</p>
    </Button>
  );
}

export default CollectButton;

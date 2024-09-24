import { useState } from 'react';
import { ThumbsDownIcon } from 'lucide-react';
import { ButtonProps } from '../PostButtons';
import { useAccount } from '@/context/account.context';
import { cn } from '@/lib/utils';
import { unlikePost, likePost } from '@/aptos/entry/feeds.entry';
import { aptosClient } from '@/utils/aptosClient';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';

export function DownvoteButton({ post }: ButtonProps) {
  const { address, signAndSubmitTransaction } = useAccount();
  const [isDownvoted, setIsDownvoted] = useState(post.down_votes.includes(`${address}`));
  const [optimisticDownvoteCount, setOptimisticDownvoteCount] = useState(
    post.down_votes.length
  );
  const [isLoading, setIsLoading] = useState(false);

  const initDownvote = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setIsDownvoted(!isDownvoted);
    setOptimisticDownvoteCount((prevCount) =>
      isDownvoted ? prevCount - 1 : prevCount + 1
    );
    setIsLoading(true);

    try {
      let response;
      if (isDownvoted) {
        // Remove like
        response = await signAndSubmitTransaction(unlikePost(post.id));
      } else {
        // Add like
        response = await signAndSubmitTransaction(likePost(post.id));
      }

      if (response) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        if (!committedTransactionResponse.success) {
          // If the transaction fails, revert the optimistic update
          setIsDownvoted(isDownvoted);
          setOptimisticDownvoteCount(post.liked_by.length);
        } else {
          // Invalidate cache to get fresh data
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Posts] });
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.PostDetails, post.id],
          });
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.Comments, post.id],
          });
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsDownvoted(isDownvoted);
      setOptimisticDownvoteCount(post.liked_by.length);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="button"
      onClick={initDownvote}
      className={cn(
        'flex items-center gap-x-1 group',
        isLoading && 'cursor-wait'
      )}
    >
      <ThumbsDownIcon
        size={20}
        className={cn(
          'text-dark dark:text-white group-hover:text-primary',
          isDownvoted ? 'fill-primary stroke-primary text-primary' : ''
        )}
      />
      <p
        className={cn(
          'text-xs group-hover:text-primary text-dark dark:text-white',
          isDownvoted ? 'text-primary' : ''
        )}
      >
        {optimisticDownvoteCount > 0 ? optimisticDownvoteCount : ''}
      </p>
    </div>
  );
}

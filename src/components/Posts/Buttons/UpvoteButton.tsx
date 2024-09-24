import { useState } from 'react';
import { ThumbsUpIcon } from 'lucide-react';
import { ButtonProps } from '../PostButtons';
import { useAccount } from '@/context/account.context';
import { cn } from '@/lib/utils';
import { unlikePost, likePost } from '@/aptos/entry/feeds.entry';
import { aptosClient } from '@/utils/aptosClient';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';

export function UpvoteButton({ post }: ButtonProps) {
  const { address, signAndSubmitTransaction } = useAccount();
  const [isUpvoted, setIsUpvoted] = useState(
    post.up_votes.includes(`${address}`)
  );
  const [optimisticUpvoteCount, setOptimisticUpvoteCount] = useState(
    post.up_votes.length
  );
  const [isLoading, setIsLoading] = useState(false);

  const initUpvote = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setIsUpvoted(!isUpvoted);
    setOptimisticUpvoteCount((prevCount) =>
      isUpvoted ? prevCount - 1 : prevCount + 1
    );
    setIsLoading(true);

    try {
      let response;
      if (isUpvoted) {
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
          setIsUpvoted(isUpvoted);
          setOptimisticUpvoteCount(post.liked_by.length);
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
      setIsUpvoted(isUpvoted);
      setOptimisticUpvoteCount(post.liked_by.length);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="button"
      onClick={initUpvote}
      className={cn(
        'flex items-center gap-x-1 group',
        isLoading && 'cursor-wait'
      )}
    >
      <ThumbsUpIcon
        size={20}
        className={cn(
          'text-dark dark:text-white group-hover:text-primary',
          isUpvoted ? 'fill-primary stroke-primary text-primary' : ''
        )}
      />
      <p
        className={cn(
          'text-xs group-hover:text-primary text-dark dark:text-white',
          isUpvoted ? 'text-primary' : ''
        )}
      >
        {optimisticUpvoteCount > 0 ? optimisticUpvoteCount : ''}
      </p>
    </div>
  );
}

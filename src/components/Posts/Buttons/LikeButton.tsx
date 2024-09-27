import { useState } from 'react';
import { HeartIcon } from 'lucide-react';
import { ButtonProps } from '../PostButtons';
import { useAccount } from '@/context/account.context';
import { cn } from '@/lib/utils';
import { unlikePost, likePost } from '@/aptos/entry/feeds.entry';
import { aptosClient } from '@/utils/aptosClient';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';

export function LikeButton({ post }: ButtonProps) {
  const { address, signAndSubmitTransaction } = useAccount();
  // console.log(post.liked_by.includes(`${address}`));
  // console.log(address);
  // 0xe0d64e0c9e761019790655f49fa224566dccaef24ed1b32de567cd4327fc8c4b
  // 0xe0d64e0c9e761019790655f49fa224566dccaef24ed1b32de567cd4327fc8c4b
  const [isLiked, setIsLiked] = useState(post.liked_by.includes(`${address}`));
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(
    post.liked_by.length
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setIsLiked(!isLiked);
    setOptimisticLikeCount((prevCount) =>
      isLiked ? prevCount - 1 : prevCount + 1
    );
    setIsLoading(true);

    try {
      let response;
      if (isLiked) {
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
          setIsLiked(isLiked);
          setOptimisticLikeCount(post.liked_by.length);
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
      setIsLiked(isLiked);
      setOptimisticLikeCount(post.liked_by.length);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="button"
      onClick={toggleLike}
      className={cn(
        'flex items-center gap-x-1 group',
        isLoading && 'cursor-wait'
      )}
    >
      <HeartIcon
        size={20}
        className={cn(
          'text-dark dark:text-white group-hover:text-primary',
          isLiked ? 'fill-primary stroke-primary text-primary' : ''
        )}
      />
      <p
        className={cn(
          'text-xs group-hover:text-primary text-dark dark:text-white',
          isLiked ? 'text-primary' : ''
        )}
      >
        {optimisticLikeCount > 0 ? optimisticLikeCount : ''}
      </p>
    </div>
  );
}

import { useState } from 'react';
import { CornerLeftUpIcon, CornerRightDownIcon } from 'lucide-react';
import { useAccount } from '@/context/account.context';
import { cn } from '@/lib/utils';
import { downVotePost, upVotePost } from '@/aptos/entry/feeds.entry';
import { aptosClient } from '@/utils/aptosClient';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';
import { ButtonProps } from '../PostButtons';

export function VoteButtons({ post }: ButtonProps) {
  const { address, signAndSubmitTransaction } = useAccount();

  // Initial vote state
  const [isUpvoted, setIsUpvoted] = useState(
    post.upvotes.includes(`${address}`)
  );
  const [isDownvoted, setIsDownvoted] = useState(
    post.downvotes.includes(`${address}`)
  );

  // Optimistic counts
  const [optimisticUpvoteCount, setOptimisticUpvoteCount] = useState(
    post.upvotes.length
  );
  const [optimisticDownvoteCount, setOptimisticDownvoteCount] = useState(
    post.downvotes.length
  );

  const [isLoading, setIsLoading] = useState(false);

  // Unified vote handler
  const handleVote = async (
    voteType: 'upvote' | 'downvote',
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (isLoading) return; // Avoid multiple votes being processed simultaneously

    setIsLoading(true);

    // Voting logic
    if (voteType === 'upvote') {
      if (isUpvoted) {
        // Do nothing if already upvoted
        setIsLoading(false);
        return;
      } else if (isDownvoted) {
        // Remove downvote and apply upvote
        setIsDownvoted(false);
        setIsUpvoted(true);
        setOptimisticDownvoteCount((prevCount) => prevCount - 1);
        setOptimisticUpvoteCount((prevCount) => prevCount + 1);
      } else {
        // Apply upvote
        setIsUpvoted(true);
        setOptimisticUpvoteCount((prevCount) => prevCount + 1);
      }
    } else if (voteType === 'downvote') {
      if (isDownvoted) {
        // Do nothing if already downvoted
        setIsLoading(false);
        return;
      } else if (isUpvoted) {
        // Remove upvote and apply downvote
        setIsUpvoted(false);
        setIsDownvoted(true);
        setOptimisticUpvoteCount((prevCount) => prevCount - 1);
        setOptimisticDownvoteCount((prevCount) => prevCount + 1);
      } else {
        // Apply downvote
        setIsDownvoted(true);
        setOptimisticDownvoteCount((prevCount) => prevCount + 1);
      }
    }

    try {
      const response = await signAndSubmitTransaction(
        voteType === 'upvote' ? upVotePost(post.id) : downVotePost(post.id)
      );

      if (response) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        if (!committedTransactionResponse.success) {
          console.error('Transaction failed');
        } else {
          // Invalidate cache to refresh data
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
      console.error('Error submitting vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Upvote Button */}
      <div
        role="button"
        onClick={(e) => handleVote('upvote', e)}
        className={cn(
          'flex items-center gap-x-1 group',
          isLoading && 'cursor-wait'
        )}
      >
        <CornerLeftUpIcon
          size={20}
          className={cn(
            'text-dark dark:text-white group-hover:text-primary',
            isUpvoted ? 'stroke-primary text-primary' : ''
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

      {/* Downvote Button */}
      <div
        role="button"
        onClick={(e) => handleVote('downvote', e)}
        className={cn(
          'flex items-center gap-x-1 group',
          isLoading && 'cursor-wait'
        )}
      >
        <CornerRightDownIcon
          size={20}
          className={cn(
            'text-dark dark:text-white group-hover:text-primary',
            isDownvoted ? 'stroke-primary text-primary' : ''
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
    </div>
  );
}

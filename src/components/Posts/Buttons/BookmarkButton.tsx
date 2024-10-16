'use client';

import React from 'react';
import { BookmarkIcon } from 'lucide-react';
import { ButtonProps } from '../PostButtons';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  addBookmark,
  getBookmarkByPostId,
  removeBookmark,
} from '@/actions/bookmark.action';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/context/account.context';

export function BookmarkButton({ post }: ButtonProps) {
  const { address } = useAccount();

  const { data: bookmarkData, refetch } = useQuery({
    queryKey: [`${post.id}`, QueryKeys.Bookmarks],
    queryFn: () => getBookmarkByPostId(`${post.id}`),
  });

  const isBookmarked = bookmarkData?.data && bookmarkData.status;

  const mutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await removeBookmark(`${post.id}`, `${address}`);
      } else {
        await addBookmark({ postId: `${post.id}`, address: `${address}` });
      }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [`${post.id}`, QueryKeys.Bookmarks],
      });

      // Snapshot the previous value
      const previousBookmark = queryClient.getQueryData([
        `${post.id}`,
        QueryKeys.Bookmarks,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData([`${post.id}`, QueryKeys.Bookmarks], {
        data: { postId: post.id, address },
        status: !isBookmarked,
      });

      // Return a context object with the snapshotted value
      return { previousBookmark };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        [`${post.id}`, QueryKeys.Bookmarks],
        context?.previousBookmark
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      refetch();
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Bookmarks] });
    },
  });

  const handleBookmark = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    mutation.mutate();
  };

  return (
    <Button
      size={'icon'}
      variant={'ghost'}
      onClick={handleBookmark}
      disabled={mutation.isPending}
    >
      <BookmarkIcon
        size={20}
        className={`${
          isBookmarked ? 'text-primary fill-primary' : 'text-dark dark:text-white'
        } group-hover:text-primary`}
      />
    </Button>
  );
}

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { IPaginatedData, IPostItem } from '@/interfaces/feed.interface';
import { QueryKeys } from '@/config/query-keys';
import { sortPostByDate } from '@/lib/posts';
import { getCommunityPosts } from '@/aptos/view/community.view';
import { useAuth } from '@/context/auth.context';
import { useAccount } from '@/context/account.context';

type Props = {
  address: string;
};

const ITEMS_PER_PAGE = 5;
function CommunityMainFeeds({ address }: Props) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { chainId, account, connected } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<IPaginatedData<IPostItem>, Error>({
      queryKey: [QueryKeys.Community, QueryKeys.CommunityFeeds, address],
      queryFn: async ({ pageParam = 1 }) => {
        const _posts = await getCommunityPosts({
          address,
          user: `${user?.wallet}`,
          page: Number(pageParam),
          itemsPerPage: ITEMS_PER_PAGE,
        });
        const sortedPost = sortPostByDate(_posts.data).filter(
          (p) => !p.post.is_comment
        );
        return {
          data: sortedPost,
          total_items: _posts.total_items,
        };
      },
      getNextPageParam: (lastPage, allPages) => {
        const loadedItemsCount = allPages.reduce(
          (total, page) => total + page.data.length,
          0
        );
        return loadedItemsCount < lastPage.total_items
          ? allPages.length + 1
          : undefined;
      },
      initialPageParam: 1,
      enabled: !!user?.wallet && connected,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return <div>CommunityMainFeeds</div>;
}

export default CommunityMainFeeds;

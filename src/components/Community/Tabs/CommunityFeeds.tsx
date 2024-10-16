'use client';

import React, { useRef, useEffect, Fragment, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { sortPostByDate } from '@/lib/posts';
import { getPublicCommunityPosts } from '@/aptos/view/community.view';
import PostItem from '../../Posts/PostItem';
import { IPaginatedData, IPostItem } from '@/interfaces/feed.interface';

const ITEMS_PER_PAGE = 10;

export default function CommunityFeeds() {
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<IPaginatedData<IPostItem>, Error>({
      queryKey: [QueryKeys.Community, QueryKeys.CommunityFeeds],
      queryFn: async ({ pageParam = 1 }) => {
        const _posts = await getPublicCommunityPosts(
          Number(pageParam),
          ITEMS_PER_PAGE
        );
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

  return (
    <div className="mx-auto w-full flex flex-col gap-8">
      {data &&
        data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map((post) => (
              <PostItem
                key={post.post.id}
                post={post.post}
                creator={post.creator}
              />
            ))}
          </Fragment>
        ))}
      {isFetchingNextPage && (
        <div className="text-center mt-4">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      )}
      {hasNextPage && (
        <div ref={observerTarget} className="h-4" aria-hidden="true" />
      )}
    </div>
  );
}

'use client';

import React, { Fragment, useEffect, useRef } from 'react';
import { IPaginatedData, IPostItem } from '@/interfaces/feed.interface';
import EmptyBox from '../../EmptyBox';
import PostItem from '../../Posts/PostItem';
import { getOwnedPosts } from '@/aptos/view/feeds.view';
import { useAccount } from '@/context/account.context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { sortPostByDate } from '@/lib/posts';
import { UserInterface } from '@/interfaces/user.interface';

type Props = {
  username: string;
  user?: UserInterface;
};

const ITEMS_PER_PAGE = 4;

function RepliesTab({ username, user }: Props) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const isOwner = address == user?.wallet;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useInfiniteQuery<IPaginatedData<IPostItem>, Error>({
    queryKey: [QueryKeys.Posts, address, QueryKeys.Replies],
    queryFn: async ({ pageParam = 1 }) => {
      const _posts = await getOwnedPosts(
        username,
        Number(pageParam),
        ITEMS_PER_PAGE
      );
      const sortedPost = sortPostByDate(_posts.data).filter(
        (p) => p.post.is_comment
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

  const renderContent = () => {
    if (status === 'pending') {
      return <div className="text-center mt-4">Loading...</div>;
    }

    if (status === 'error') {
      return <div className="text-center mt-4">Error: fetching replies</div>;
    }

    if (data.pages[0].data.length === 0) {
      return (
        <EmptyBox
          title="Empty Replies"
          message={`${
            isOwner ? 'You' : `${username}`
          } currently do not have any replies`}
        />
      );
    }

    return (
      <>
        {data &&
          data.pages.map((page, i) => (
            <Fragment key={i}>
              {page.data.map((post) => (
                <div
                  key={post.post.id}
                  className="border-b border-light last:border-none"
                >
                  <PostItem
                    post={post.post}
                    creator={post.creator}
                    className="rounded-none shadow-none"
                  />
                </div>
              ))}
            </Fragment>
          ))}
        {isFetching && isFetchingNextPage && (
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
      </>
    );
  };

  return (
    <>
      {renderContent()}
      <div ref={observerTarget} className="h-4 mb-2" aria-hidden="true" />
    </>
  );
}

export default RepliesTab;

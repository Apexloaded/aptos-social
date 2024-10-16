'use client';

import { getOwnedPosts } from '@/aptos/view/feeds.view';
import EmptyBox from '@/components/EmptyBox';
import PostItem from '@/components/Posts/PostItem';
import { QueryKeys } from '@/config/query-keys';
import { useAccount } from '@/context/account.context';
import { IPaginatedData, IPostItem } from '@/interfaces/feed.interface';
import { UserInterface } from '@/interfaces/user.interface';
import { sortPostByDate } from '@/lib/posts';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { Fragment, useCallback, useEffect, useRef } from 'react';

type Props = {
  username: string;
  user?: UserInterface;
};

const ITEMS_PER_PAGE = 4;

function CollectibleTab({ username, user }: Props) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const { address, connected } = useAccount();
  const isOwner = address == user?.wallet;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useInfiniteQuery<IPaginatedData<IPostItem>, Error>({
    queryKey: [QueryKeys.Posts, address, QueryKeys.CollectibleAssets],
    queryFn: async ({ pageParam = 1 }) => {
      const _posts = await getOwnedPosts(
        username,
        Number(pageParam),
        ITEMS_PER_PAGE
      );
      const sortedPost = sortPostByDate(_posts.data).filter(
        (p) => !p.post.is_comment && p.post.author == user?.wallet
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
    enabled: !!username && connected && !!user,
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0.1 };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const renderContent = () => {
    if (status === 'pending') {
      return <div className="text-center mt-4">Loading...</div>;
    }

    if (status === 'error') {
      return (
        <div className="text-center mt-4">Error: fetching collectibles</div>
      );
    }

    if (data.pages[0].data.length === 0) {
      return (
        <EmptyBox
          title={'No collectible'}
          message={'There is no collectible on this profile'}
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
        {(isFetching || isFetchingNextPage) && (
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

export default CollectibleTab;

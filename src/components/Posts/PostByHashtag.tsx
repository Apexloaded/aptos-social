'use client';

import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PostItem from './PostItem';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { getPostByHashtag } from '@/aptos/view/feeds.view';
import { sortPostByDate } from '@/lib/posts';
import { useAccount } from '@/context/account.context';
import { IPaginatedData, IPostItem } from '@/interfaces/feed.interface';
import EmptyBox from '../EmptyBox';

type Props = {
  hashtag: string;
};

const ITEMS_PER_PAGE = 4;

export function PostsByHashtag({ hashtag }: Props) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useInfiniteQuery<IPaginatedData<IPostItem>, Error>({
    queryKey: [QueryKeys.Hashtag, hashtag],
    queryFn: async ({ pageParam = 1 }) => {
      const _posts = await getPostByHashtag(
        hashtag,
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
    enabled: shouldFetch,
  });

const handleObserver = useCallback(
  (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      setShouldFetch(true);
      fetchNextPage();
    }
  },
  [fetchNextPage, hasNextPage, isFetchingNextPage]
);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '200px',
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

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
          title="No Post"
          message={`No post was found with hashtag ${hashtag}`}
        />
      );
    }

    return (
      <>
        {data &&
          data.pages.map((page, i) => (
            <Fragment key={i}>
              {page.data.map((post) => (
                <PostItem
                  key={post.post.id}
                  post={post.post}
                  creator={post.creator}
                  className="rounded-none shadow-none"
                />
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
        {!hasNextPage && (
          <p className="text-center text-gray-500 mt-6">
            No more posts to load.
          </p>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto w-full flex flex-col gap-8">
      {renderContent()}
      {hasNextPage && (
        <div ref={observerTarget} className="h-4 mb-2" aria-hidden="true" />
      )}
    </div>
  );
}

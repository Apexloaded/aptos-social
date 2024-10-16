'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import BookmarkItem from './BookmarkItem';
import { LoaderCircleIcon } from 'lucide-react';
import { IBookmark } from '@/interfaces/bookmark.interface';
import { QueryKeys } from '@/config/query-keys';
import { getAllBookmarks } from '@/actions/bookmark.action';
import EmptyBox from '../EmptyBox';
import { useAccount } from '@/context/account.context';

function BookmarkFeeds() {
  const { address } = useAccount();
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);
  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.Bookmarks],
    queryFn: () => getAllBookmarks(`${address}`),
    enabled: !!address,
  });

  useEffect(() => {
    console.log(data);
    if (data?.data && data.status) {
      setBookmarks(data.data);
    }
  }, [data?.data, data?.status]);

  return (
    <div>
      {isLoading && (
        <div className="flex py-3 justify-center w-full">
          <LoaderCircleIcon
            size={30}
            className="animate-spin duration-500 text-primary"
          />
        </div>
      )}

      {bookmarks.length > 0 && (
        <>
          {bookmarks.map((b, i) => (
            <BookmarkItem key={i} bookmark={b} />
          ))}
        </>
      )}
      {bookmarks.length < 1 && !isLoading && (
        <EmptyBox title="No Bookmarks" message="Try to bookmark a post" />
      )}
    </div>
  );
}

export default BookmarkFeeds;

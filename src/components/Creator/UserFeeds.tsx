'use client';

import React from 'react';
import { IPostItem } from '@/interfaces/feed.interface';
import EmptyBox from '../EmptyBox';
import { PostItem } from '../Posts/PostItem';

type Props = {
  posts: IPostItem[];
  msg: string;
  title?: string;
};

function UserFeeds({ posts, msg, title = 'No item found' }: Props) {
  return (
    <div>
      {posts.length > 0 ? (
        <>
          {posts.map(({ post, creator }: IPostItem, index: number) => (
            <div key={index} className="border-b border-light last:border-none">
              <PostItem
                post={post}
                creator={creator}
                className="rounded-none shadow-none"
              />
            </div>
          ))}
        </>
      ) : (
        <>
          <div>
            <div className="text-center py-20">
              <EmptyBox title={title} message={`${msg}`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserFeeds;

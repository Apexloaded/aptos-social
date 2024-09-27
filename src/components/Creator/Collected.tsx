'use client';

import React, { useEffect, useState } from 'react';
import { IPostItem } from '@/interfaces/feed.interface';
import { PostItem } from '../Posts/PostItem';
import EmptyBox from '../EmptyBox';

type Props = {
  posts: IPostItem[];
  username: string;
};

function Collected({ posts, username }: Props) {
  return (
    <div>
      {posts.length > 0 ? (
        <>
          {posts.map(({ post, creator }: IPostItem, index: number) => (
            <div key={index} className="border-b border-light last:border-none">
              <PostItem post={post} creator={creator} />
            </div>
          ))}
        </>
      ) : (
        <div>
          <div className="text-center py-20">
            <EmptyBox
              title="Empty remints"
              message={`${username} haven't collected any mintable`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Collected;

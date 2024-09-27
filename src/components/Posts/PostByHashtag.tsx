'use client';

import React from 'react';
import { PostItem } from './PostItem';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { getPostByHashtag } from '@/aptos/view/feeds.view';
import { sortPostByDate } from '@/lib/posts';

type Props = {
  hashtag: string;
};
export function PostsByHashtag({ hashtag }: Props) {
  const { data } = useQuery({
    queryKey: [QueryKeys.Posts, QueryKeys.Hashtag, hashtag],
    queryFn: async () => {
      const _posts = await getPostByHashtag(hashtag);
      const sortedPost = sortPostByDate(_posts).filter(
        (p) => !p.post.is_comment
      );
      return sortedPost;
    },
  });

  return (
    <div className="mx-auto w-full flex flex-col gap-8">
      {data &&
        data.map((post, i) => (
          <PostItem
            key={post.post.id}
            post={post.post}
            creator={post.creator}
          />
        ))}
    </div>
  );
}

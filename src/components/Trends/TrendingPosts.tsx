'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { getTrendingPosts } from '@/aptos/view/feeds.view';
import { mapPost } from '@/lib/posts';
import { PostItem } from '../Posts/PostItem';
import { IPostItem } from '@/interfaces/feed.interface';

export function TrendingPosts() {
  const { data } = useQuery({
    queryKey: [QueryKeys.TrendingPosts],
    queryFn: async () => {
      const _posts = await getTrendingPosts();
      const sortedPost = _posts
        .sort((a, b) => b.score - a.score)
        .map((p) => p.post)
        .map((p: IPostItem) => {
          return {
            creator: p.creator,
            post: mapPost(p.post),
          } as IPostItem;
        });
      return sortedPost;
    },
  });

  return (
    <>
      {data && data?.length > 0 && (
        <div className="mx-auto w-full flex flex-col gap-8 bg-muted dark:bg-dark-light p-5">
          {data &&
            data.map((post, i) => (
              <PostItem
                key={post.post.id}
                post={post.post}
                creator={post.creator}
              />
            ))}
        </div>
      )}
    </>
  );
}

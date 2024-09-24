'use client';

import React, { useState } from 'react';
import { PostItem } from './PostItem';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { getAllPosts } from '@/aptos/view/feeds.view';
import { sortPostByDate } from '@/lib/posts';

export function Posts() {
  // const [posts, setPosts] = useState<IPostItem[]>([]);
  const { data } = useQuery({
    queryKey: [QueryKeys.Posts],
    queryFn: async () => {
      const _posts = await getAllPosts();
      console.log(_posts);
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

'use client';

import posts from '@/posts';
import { PostItem } from './PostItem';

export function Posts() {
  const postArray = posts;
  return (
    <div className="max-w-md mx-auto w-full flex flex-col gap-8">
      {postArray.map((post, i) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}

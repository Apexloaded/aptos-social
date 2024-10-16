'use client';

import { IBookmark } from '@/interfaces/bookmark.interface';
import { IPostItem } from '@/interfaces/feed.interface';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { getPostById } from '@/aptos/view/feeds.view';
import { mapPost } from '@/lib/posts';
import PostItem from '../Posts/PostItem';

type Props = {
  bookmark: IBookmark;
};

function BookmarkItem({ bookmark }: Props) {
  const [post, setPost] = useState<IPostItem | undefined>();

  const { data } = useQuery({
    queryKey: [QueryKeys.PostDetails, bookmark.postId],
    queryFn: async () => {
      const response = await getPostById(Number(bookmark.postId));
      const mappedPost = mapPost(response.post);
      return { creator: response.creator, post: mappedPost } as IPostItem;
    },
    enabled: !!bookmark,
  });

  useEffect(() => {
    if (data) {
      setPost(data);
    }
  }, [data]);

  return (
    <div>{post && <PostItem post={post.post} creator={post.creator} />}</div>
  );
}

export default BookmarkItem;

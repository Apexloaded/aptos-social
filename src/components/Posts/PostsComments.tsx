'use client';

import React, { useEffect, useState } from 'react';
import { IPostItem } from '@/interfaces/feed.interface';
// import NewComment from './NewComment';
import CommentItems from './CommentItems';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { getPostComments } from '@/aptos/view/feeds.view';
import { sortPostByDate } from '@/lib/posts';
import NewComment from './NewComment';

type Props = {
  post: IPostItem;
};

function PostsComment({ post }: Props) {
  const { data: posts } = useQuery({
    queryKey: [QueryKeys.Comments, post.post.id],
    queryFn: async () => {
      const response = await getPostComments(post.post.id);
      const mappedComments = sortPostByDate(response);
      return mappedComments;
    },
  });

  // useEffect(() => {
  //   if (data) {
  //     const postArr = data as Post[];
  //     const sortedPost = sortPostByDate(postArr);
  //     setPosts(sortedPost);
  //   }
  // }, [data]);

  // const refetchComments = async () => {
  //   const response = await refetch();
  //   const postArr = response.data as Post[];
  //   const sortedPost = sortPostByDate(postArr);
  //   setPosts(sortedPost);
  // };

  return (
    <div className="mb-20">
      <div className="border-b border-light">
        <NewComment post={post} />
      </div>
      {posts?.map((post, index) => (
        <div key={index} className="border-b border-light last:border-none">
          <CommentItems post={post.post} creator={post.creator} />
        </div>
      ))}
    </div>
  );
}

export default PostsComment;

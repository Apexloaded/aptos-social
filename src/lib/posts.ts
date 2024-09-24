import { IPost, IPostItem } from '@/interfaces/feed.interface';
import { timestampToDate } from '@/utils/helpers';

export const sortPostByDate = (posts: IPostItem[]) => {
  return posts
    .sort((a, b) => {
      const dateA = timestampToDate(a.post.created_at).getTime();
      const dateB = timestampToDate(b.post.created_at).getTime();
      return dateB - dateA;
    })
    .map((p: IPostItem) => {
      return {
        creator: p.creator,
        post: mapPost(p.post),
      } as IPostItem;
    });
};

export const mapPost = (post: IPost) => {
  const { created_at, tip_count, comment_count, id, ...payload } = post;
  return {
    id: Number(id),
    created_at: timestampToDate(post.created_at).toISOString(),
    tip_count: Number(post.tip_count),
    comment_count: Number(post.comment_count),
    ...payload,
  } as IPost;
};

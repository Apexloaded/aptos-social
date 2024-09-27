import { IPost } from '@/interfaces/feed.interface';
import { CommentButton } from './Buttons/CommentButton';
import { LikeButton } from './Buttons/LikeButton';
import { ShareButton } from './Buttons/ShareButton';
import { UserInterface } from '@/interfaces/user.interface';
import { VoteButtons } from './Buttons/VoteButton';

export interface ButtonProps {
  post: IPost;
  creator: UserInterface;
}
export function PostButtons({ post, creator }: ButtonProps) {
  return (
    <div className="flex items-center space-x-4">
      <LikeButton post={post} creator={creator} />
      <VoteButtons post={post} creator={creator} />
      <CommentButton post={post} creator={creator} />
      <ShareButton post={post} creator={creator} />
    </div>
  );
}

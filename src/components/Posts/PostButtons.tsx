import { IPost } from "@/interfaces/feed.interface";
import { CommentButton } from "./Buttons/CommentButton";
import { LikeButton } from "./Buttons/LikeButton";
import { ShareButton } from "./Buttons/ShareButton";

export interface ButtonProps {
  post: IPost;
}
export function PostButtons({ post }: ButtonProps) {
  return (
    <div className="flex items-center space-x-4">
      <LikeButton post={post} />
      <CommentButton post={post} />
      <ShareButton post={post} />
    </div>
  );
}

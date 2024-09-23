import { HeartIcon } from 'lucide-react';
import { ButtonProps } from '../PostButtons';

export function LikeButton({ post }: ButtonProps) {
  return (
    <div role="button" className="flex items-center gap-x-1 group">
      <HeartIcon
        size={20}
        className="text-dark dark:text-white group-hover:text-primary"
      />
      <p className="text-xs group-hover:text-primary text-dark dark:text-white">
        {post.liked_by.length > 0 ? post.liked_by.length : ''}
      </p>
    </div>
  );
}

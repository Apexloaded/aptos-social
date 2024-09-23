import { MessageSquareTextIcon } from 'lucide-react';
import { ButtonProps } from '../PostButtons';

export function CommentButton({ post }: ButtonProps) {
  return (
    <div role="button" className="flex items-center gap-x-1 group">
      <MessageSquareTextIcon
        size={20}
        className="text-dark dark:text-white group-hover:text-primary"
      />
      <p className="text-xs group-hover:text-primary text-dark dark:text-white">
        {post.comment_count > 0 ? post.comment_count : ''}
      </p>
    </div>
  );
}

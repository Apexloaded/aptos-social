import { BookmarkIcon } from "lucide-react";
import { ButtonProps } from "../PostButtons";

export function BookmarkButton({ post }: ButtonProps) {
  return (
    <BookmarkIcon
      size={20}
      className="text-dark dark:text-white group-hover:text-primary"
    />
  );
}

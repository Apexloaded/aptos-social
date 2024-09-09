import { ShareIcon } from "lucide-react";
import { ButtonProps } from "../PostButtons";

export function ShareButton({ post }: ButtonProps) {
  return (
    <div role="button" className="flex items-center gap-x-1 group">
      <ShareIcon
        size={20}
        className="text-dark dark:text-white group-hover:text-primary"
      />
    </div>
  );
}

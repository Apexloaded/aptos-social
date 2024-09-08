import { ShareIcon } from "lucide-react";

export function Share() {
  return (
    <div role="button" className="flex items-center gap-x-1 group">
      <ShareIcon
        size={20}
        className="text-dark dark:text-white group-hover:text-primary"
      />
    </div>
  );
}

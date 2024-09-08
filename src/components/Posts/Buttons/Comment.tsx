import { Button } from "@/components/ui/button";
import { MessageSquareTextIcon } from "lucide-react";

export function Comment() {
  return (
    <div role="button" className="flex items-center gap-x-1 group">
      <MessageSquareTextIcon
        size={20}
        className="text-dark dark:text-white group-hover:text-primary"
      />
      <p className="text-xs group-hover:text-primary text-dark dark:text-white">398</p>
    </div>
  );
}

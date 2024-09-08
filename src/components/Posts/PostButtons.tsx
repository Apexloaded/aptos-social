import { Comment } from "./Buttons/Comment";
import { Like } from "./Buttons/Like";
import { Share } from "./Buttons/Share";

export function PostButtons() {
  return (
    <div className="flex items-center space-x-4">
      <Like />
      <Comment />
      <Share />
    </div>
  );
}

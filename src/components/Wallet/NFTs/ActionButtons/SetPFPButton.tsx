import { INFT } from '@/interfaces/feed.interface';
import { ImageIcon } from 'lucide-react';

type Props = {
  nft: INFT;
};
export default function SetPFPButton({ nft }: Props) {
  return (
    <div
      role="button"
      className="py-2 px-3 hover:bg-secondary dark:hover:bg-dark dark:text-white flex items-center gap-3"
    >
      <ImageIcon size={20} />
      <p>Set as PFP</p>
    </div>
  );
}

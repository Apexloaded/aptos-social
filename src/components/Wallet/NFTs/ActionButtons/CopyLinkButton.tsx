import { HOSTNAME } from '@/config/constants';
import useClipBoard from '@/hooks/clipboard.hook';
import useToast from '@/hooks/toast.hook';
import { INFT } from '@/interfaces/feed.interface';
import { LinkIcon } from 'lucide-react';

type Props = {
  nft: INFT;
};
export default function CopyLinkButton({ nft }: Props) {
  const { copy } = useClipBoard();
  const { success } = useToast();

  const handleCopyLink = () => {
    copy(`https://${HOSTNAME}/nft/${nft.current_token_data?.token_data_id}`);
    success({ msg: 'Link copied to clipboard!' });
  };

  return (
    <div
      onClick={handleCopyLink}
      role="button"
      className="py-2 px-3 hover:bg-secondary dark:hover:bg-dark dark:text-white flex items-center gap-3"
    >
      <LinkIcon size={20} />
      <p>Copy link</p>
    </div>
  );
}

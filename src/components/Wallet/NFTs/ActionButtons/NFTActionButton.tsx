import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { INFT } from '@/interfaces/feed.interface';
import { EllipsisIcon } from 'lucide-react';
import BurnButton from './BurnButton';
import CopyLinkButton from './CopyLinkButton';
import SetPFPButton from './SetPFPButton';
import TransferButton from './TransferButton';
type Props = {
  nft: INFT;
};
export default function NFTActionButton({ nft }: Props) {
  return (
    <Popover>
      <PopoverTrigger className="bg-secondary dark:bg-dark-light dark:hover:bg-dark text-secondary-foreground hover:bg-secondary/80 h-10 w-10 rounded-full flex items-center justify-center">
        <EllipsisIcon size={20} className='dark:text-white' />
      </PopoverTrigger>
      <PopoverContent
        sideOffset={5}
        className="bg-white dark:bg-dark-light shadow-2xl overflow-hidden border-none w-40 p-0"
      >
        <div className="flex flex-col">
          <TransferButton nft={nft} />
          <SetPFPButton nft={nft} />
          <CopyLinkButton nft={nft} />
          <BurnButton nft={nft} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

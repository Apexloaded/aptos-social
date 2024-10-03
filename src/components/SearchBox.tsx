import { SearchIcon } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};
export default function SearchBox({ className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center bg-secondary dark:bg-dark-light px-4',
        className
      )}
    >
      <SearchIcon className="text-dark dark:text-white" />
      <Input
        className="rounded-full h-11 border-none text-white"
        placeholder="Looking for something?"
      />
    </div>
  );
}

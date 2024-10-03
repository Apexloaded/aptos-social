import { SearchIcon } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};
export default function SearchBox({ className }: Props) {
  return (
    <div className={cn('px-4 pt-1', className)}>
      <div className="flex items-center bg-secondary px-4">
        <SearchIcon />
        <Input
          className="rounded-full h-11 border-none"
          placeholder="Looking for something?"
        />
      </div>
    </div>
  );
}

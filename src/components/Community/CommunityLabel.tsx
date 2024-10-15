import { getCommunity } from '@/aptos/view/community.view';
import { QueryKeys } from '@/config/query-keys';
import { formatWalletAddress } from '@/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { GroupIcon } from 'lucide-react';

type Props = {
  address: string;
};
export default function CommunityLabel({ address }: Props) {
  const { data } = useQuery({
    queryKey: [QueryKeys.Community, address],
    queryFn: async () => getCommunity(address),
  });

  if (!data) return null;

  return (
    <div className="mb-2 flex items-center gap-2">
      <GroupIcon className="text-primary" size={20} />
      <div className="flex bg-secondary dark:bg-dark-light px-3 py-1 rounded-2xl items-center gap-2">
        <p className="text-dark dark:text-white font-bold capitalize">
          {data.name}
        </p>
        <p className="text-primary font-bold text-sm">
          {formatWalletAddress(address)}
        </p>
      </div>
    </div>
  );
}

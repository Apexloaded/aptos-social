import Image from 'next/image';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/routes';
import Identicon from '@polkadot/react-identicon';

type Props = {
  pfp?: string;
  username?: string;
  name?: string;
  className?: string;
};
function CreatorPFP({ pfp, username, name, className }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(routes.app.profile(`${username}`));
  }, [username]);

  const profile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    router.push(routes.app.profile(`${username}`));
  };

  return (
    <div
      role="button"
      onClick={profile}
      className={`w-10 relative ${className}`}
    >
      {pfp ? (
        <Image
          src={pfp}
          height={400}
          width={400}
          alt={'PFP'}
          placeholder="blur"
          blurDataURL="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
          className="h-10 w-10 rounded-full"
          priority={true}
        />
      ) : (
        <div className="flex items-center justify-center h-10 w-10 bg-white/90 dark:bg-dark-light">
          <Identicon value={username} size={32} theme={'ethereum'} />
        </div>
      )}
    </div>
  );
}

export default CreatorPFP;

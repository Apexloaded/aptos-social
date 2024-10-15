'use client';

import { Button } from '@/components/ui/button';
import Header from '@/components/ui/header';
import { MediaQueryValues, useMediaQuery } from '@/hooks/media-query.hook';
import { useAppDispatch } from '@/hooks/redux.hook';
import { cn } from '@/lib/utils';
import { closeSidebar } from '@/slices/settings/sidebar.slice';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountSettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLargeScreen = useMediaQuery(MediaQueryValues.LG);

  const returnBack = () => {
    dispatch(closeSidebar());
    router.back();
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl pr-3 dark:bg-dark/80 mx-auto flex items-center justify-between w-full sticky top-0 z-10">
      <div className="py-3 sticky z-50 top-0">
        <div className={`flex items-center justify-start space-x-0`}>
          <Button
            variant={'ghost'}
            onClick={returnBack}
            size="icon"
            className={cn('-translate-x-3', isLargeScreen && 'hidden')}
          >
            <ArrowLeft height={23} />
          </Button>
          <p className="text-xl font-semibold text-dark dark:text-white">
            Account Settings
          </p>
        </div>
      </div>
    </div>
  );
}

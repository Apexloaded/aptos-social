'use client';

import SettingsAside from '@/components/Settings/SettingsAside';
import { MediaQueryValues, useMediaQuery } from '@/hooks/media-query.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { cn } from '@/lib/utils';
import { selectSettingsSidebar } from '@/slices/settings/sidebar.slice';

export default function SettingsInnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMinLgScr = useMediaQuery(MediaQueryValues.LG);
  const isOpen = useAppSelector(selectSettingsSidebar);

  return (
    <div className="flex h-svh overflow-hidden relative overscroll-contain">
      <SettingsAside />
      <div className={cn('flex-1 w-4/5', !isOpen && !isMinLgScr && 'hidden')}>
        {children}
      </div>
    </div>
  );
}
